export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No Date';

  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const target = new Date(year, month, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetClean = new Date(year, month, day);
  targetClean.setHours(0, 0, 0, 0);

  const diffDays = Math.round((targetClean.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return 'No Time';

  const parts = timeString.split(':');
  if (parts.length < 2) return timeString;

  let hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (isNaN(hour) || isNaN(minute)) return timeString;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const minuteFormatted = minute < 10 ? `0${minute}` : minute;

  return `${hour}:${minuteFormatted} ${ampm}`;
}

export function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

export function isUpcoming(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString > today;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
