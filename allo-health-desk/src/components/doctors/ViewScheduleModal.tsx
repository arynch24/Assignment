'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Coffee, CalendarDays, Loader2, ChevronLeft, ChevronRight, Edit, Save, List } from 'lucide-react';
import { toast } from 'sonner';
import { doctorApi } from '@/lib/api/doctorApi';
import type { Schedule, Break } from '@/types/doctor';

interface ViewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  onUpdateSchedule: (schedules: Schedule[]) => Promise<void>;
  onUpdateBreaks: (breaks: Break[]) => Promise<void>;
}

export default function ViewScheduleModal({
  isOpen,
  onClose,
  doctorId,
  onUpdateSchedule,
  onUpdateBreaks
}: ViewScheduleModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  const dayOfWeekMap: { [key: number]: string } = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY'
  };

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    if (isOpen && doctorId) {
      const fetchSchedule = async () => {
        try {
          setLoading(true);
          const data = await doctorApi.getSchedulesWithBreaks(doctorId);
          setSchedules(data.schedules);
          setBreaks(data.breaks);
        } catch (err) {
          toast.error('Failed to load schedule');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSchedule();
    }
  }, [doctorId, isOpen]);

  const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
    setSchedules(prev => {
      const newSchedules = [...prev];
      newSchedules[index] = { ...newSchedules[index], [field]: value };
      return newSchedules;
    });
  };

  const handleBreakChange = (index: number, field: keyof Break, value: any) => {
    setBreaks(prev => {
      const newBreaks = [...prev];
      newBreaks[index] = { ...newBreaks[index], [field]: value };
      return newBreaks;
    });
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      await onUpdateSchedule(schedules);
      await onUpdateBreaks(breaks);
      setIsEditing(false);
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeShort = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const getWeekDays = (startDate: Date) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const getScheduleForDay = (dayOfWeek: string) => {
    const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
    const dayBreaks = breaks.filter(b => b.dayOfWeek === dayOfWeek);
    return { schedule, breaks: dayBreaks };
  };

  const timeToPixels = (time: string, hourHeight: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours + minutes / 60) * hourHeight;
  };

  const renderCalendarView = () => {
    const weekDays = getWeekDays(currentWeekStart);
    const hourHeight = 60;
    const minHour = 0;
    const maxHour = 24;
    const displayHours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-white z-10 -mt-4">
          <div className="flex items-center gap-3">
            <button onClick={goToToday} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50">
              Today
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => navigateWeek('prev')} className="p-2 rounded-md hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => navigateWeek('next')} className="p-2 rounded-md hover:bg-gray-100">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-semibold">
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-8 border-b bg-white sticky top-0 z-10">
          <div className="w-31 border-r"></div>
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className="p-4 text-center border-r">
                <div className="text-xs font-medium text-gray-600 uppercase">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-2xl font-semibold mt-1 ${isToday ? 'bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto pt-2">
          <div className="grid grid-cols-8">
            <div className="border-r">
              {displayHours.map(hour => (
                <div key={hour} className="text-xs text-gray-500 text-right pr-2 relative" style={{ height: `${hourHeight}px` }}>
                  <span className="absolute -top-2 right-2">{formatTimeShort(hour)}</span>
                </div>
              ))}
            </div>

            {weekDays.map((day, dayIdx) => {
              const dayOfWeek = dayOfWeekMap[day.getDay()];
              const { schedule, breaks: dayBreaks } = getScheduleForDay(dayOfWeek);

              return (
                <div key={dayIdx} className="border-r relative">
                  {displayHours.map(hour => (
                    <div key={hour} className="border-b border-gray-100" style={{ height: `${hourHeight}px` }} />
                  ))}

                  {schedule?.isWorking && (
                    <div
                      className="absolute left-1 right-1 bg-blue-500 bg-opacity-20 border-l-4 border-blue-600 rounded px-2 overflow-hidden"
                      style={{
                        top: `${timeToPixels(schedule.startTime, hourHeight) - minHour * hourHeight}px`,
                        height: `${timeToPixels(schedule.endTime, hourHeight) - timeToPixels(schedule.startTime, hourHeight)}px`
                      }}
                    >
                      <div className="text-xs font-semibold text-blue-900">Working Hours</div>
                      <div className="text-xs text-blue-800 mt-1">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>

                      {dayBreaks.map(breakItem => {
                        const breakTop = timeToPixels(breakItem.startTime, hourHeight) - timeToPixels(schedule.startTime, hourHeight);
                        const breakHeight = timeToPixels(breakItem.endTime, hourHeight) - timeToPixels(breakItem.startTime, hourHeight);

                        return (
                          <div
                            key={breakItem.id}
                            className="absolute left-0 right-0 bg-amber-100 border-l-4 border-amber-600 rounded p-1 mx-1"
                            style={{ top: `${breakTop}px`, height: `${breakHeight}px` }}
                          >
                            <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                              <Coffee className="w-3 h-3" />
                              {breakItem.breakType}
                            </div>
                            <div className="text-xs text-amber-800">
                              {formatTime(breakItem.startTime)} - {formatTime(breakItem.endTime)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!schedule?.isWorking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Badge variant="secondary" className="text-xs">Day Off</Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t p-3 bg-gray-50 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 bg-opacity-20 border-l-4 border-blue-600"></div>
            <span>Working Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border-l-4 border-amber-600"></div>
            <span>Breaks</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTableView = () => {
    return (
      <div className="space-y-3 px-6 overflow-auto">
        <div>
          <h3 className="font-semibold mb-3">Working Hours</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Start Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">End Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((sched, index) => (
                  <tr key={sched.id || index}>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <select
                          value={sched.dayOfWeek}
                          onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        >
                          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      ) : (
                        sched.dayOfWeek
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="time"
                          value={sched.startTime.slice(0, 5)}
                          onChange={(e) => handleScheduleChange(index, 'startTime', `${e.target.value}:00`)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        sched.startTime.slice(0, 5)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="time"
                          value={sched.endTime.slice(0, 5)}
                          onChange={(e) => handleScheduleChange(index, 'endTime', `${e.target.value}:00`)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        sched.endTime.slice(0, 5)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <select
                          value={sched.isWorking.toString()}
                          onChange={(e) => handleScheduleChange(index, 'isWorking', e.target.value === 'true')}
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="true">Working</option>
                          <option value="false">Off</option>
                        </select>
                      ) : (
                        sched.isWorking ? 'Working' : 'Off'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='mb-6'>
          <h3 className="font-semibold mb-3">Breaks</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Start Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">End Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {breaks.map((brk, index) => (
                  <tr key={brk.id || index}>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <select
                          value={brk.dayOfWeek}
                          onChange={(e) => handleBreakChange(index, 'dayOfWeek', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        >
                          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      ) : (
                        brk.dayOfWeek
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="time"
                          value={brk.startTime.slice(0, 5)}
                          onChange={(e) => handleBreakChange(index, 'startTime', `${e.target.value}:00`)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        brk.startTime.slice(0, 5)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="time"
                          value={brk.endTime.slice(0, 5)}
                          onChange={(e) => handleBreakChange(index, 'endTime', `${e.target.value}:00`)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        brk.endTime.slice(0, 5)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <select
                          value={brk.breakType}
                          onChange={(e) => handleBreakChange(index, 'breakType', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="LUNCH">Lunch</option>
                          <option value="BREAK">Break</option>
                          <option value="MEETING">Meeting</option>
                        </select>
                      ) : (
                        brk.breakType
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Doctor Schedule</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[1000px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="w-5 h-5" />
              Doctor Schedule
            </DialogTitle>
            <div className="flex items-center gap-2 mr-6">
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${viewMode === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${viewMode === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <List className="w-4 h-4" />
                  Table
                </button>
              </div>
              {viewMode === 'table' && (
                !isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                ) : (
                  <Button size="sm" onClick={saveChanges} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
        </DialogHeader>

        <div className=" overflow-y-auto">
          {viewMode === 'calendar' ? renderCalendarView() : renderTableView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}