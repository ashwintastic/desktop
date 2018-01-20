class NotificationUtil {

  showNotification(ref, level, message) {
    ref.addNotification({ level, message, position: 'tc', autoDismiss: 1, dismissible: true });
  }
}

export default new NotificationUtil();
