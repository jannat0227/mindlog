export function useNotifications() {
  const isSupported = 'Notification' in window

  const requestPermission = async () => {
    if (!isSupported) return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    return await Notification.requestPermission()
  }

  const saveReminderTime = (time) => {
    localStorage.setItem('reminderTime', time)
  }

  const getReminderTime = () => {
    return localStorage.getItem('reminderTime') || ''
  }

  const checkAndNotify = () => {
    if (!isSupported || Notification.permission !== 'granted') return

    const reminderTime = localStorage.getItem('reminderTime')
    if (!reminderTime) return

    const now = new Date()
    const [hours, minutes] = reminderTime.split(':').map(Number)
    const scheduled = new Date()
    scheduled.setHours(hours, minutes, 0, 0)

    const diffMs = Math.abs(now - scheduled)
    if (diffMs < 60000) {
      const today = now.toDateString()
      const lastNotified = localStorage.getItem('lastNotified')
      if (lastNotified !== today) {
        new Notification('MindLog — Daily Check-in', {
          body: "Time for your daily mood check-in. How are you feeling today?",
          icon: '/favicon.ico',
        })
        localStorage.setItem('lastNotified', today)
      }
    }
  }

  return {
    isSupported,
    requestPermission,
    saveReminderTime,
    getReminderTime,
    checkAndNotify,
    permission: isSupported ? Notification.permission : 'unsupported',
  }
}
