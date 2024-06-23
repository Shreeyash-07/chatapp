import { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database'; 
import { ref, onDisconnect, update,onValue } from 'firebase/database';
import { useAuth } from '../../contexts/authContext'; 
import { database } from '../../firebase/firebase'; 

const PresenceService = () => {
  const { currentUser } = useAuth(); 
  useEffect(() => {
    const updateOnUser = () => {
      const connectedRef = ref(database, '.info/connected');
      const statusRef = ref(database, `users/${currentUser.uid}`);

      onDisconnect(statusRef).update({ status: 'offline', timestamp: firebase.database.ServerValue.TIMESTAMP });

      update(statusRef, { status: 'online', timestamp: firebase.database.ServerValue.TIMESTAMP });

      onValue(connectedRef,snap=>{
        if (snap.val() === true) {
            update(statusRef, { status: 'online', timestamp: firebase.database.ServerValue.TIMESTAMP });
          } else {
            update(statusRef, { status: 'offline', timestamp: firebase.database.ServerValue.TIMESTAMP });
          }
      })
    };

    const updateOnAway = () => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          setPresence('away');
        } else {
          setPresence('online');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    const setPresence = async (status) => {
      if (currentUser) {
        await update(ref(database, `users/${currentUser.uid}`), { status, timestamp: firebase.database.ServerValue.TIMESTAMP });
      }
    };

    updateOnUser();
    updateOnAway();

    return () => {
      if (currentUser) {
        update(ref(database, `users/${currentUser.uid}`), { status: 'offline', timestamp: firebase.database.ServerValue.TIMESTAMP });
      }
    };
  }, [currentUser]);

  return null; 
};

export default PresenceService;
