'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return new Promise((resolve, reject) => {
    signInAnonymously(authInstance).then(resolve).catch(reject);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(authInstance, email, password)
            .then(resolve)
            .catch(reject);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(authInstance, email, password)
            .then(resolve)
            .catch(reject);
    });
}
