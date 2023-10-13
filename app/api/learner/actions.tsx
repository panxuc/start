import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { ApiError } from "thu-learn-lib";
import { helperSlice } from "./helper";
import { RootState } from "./store";
import { getStoredCredential, storeCredential } from "./utils/storage";

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;
export const { loggedIn, loggedOut } = helperSlice.actions;

// here we don't catch errors in login(), for there are two cases:
// 1. silent login when starting, then NetworkErrorDialog should be shown
// 2. explicit login in LoginDialog, then login dialog should still be shown
export const login =
  (username: string, password: string, save: boolean): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const helperState = getState().helper;
    const helper = helperState.helper;

    // wait at most 5 seconds for timeout
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject({ reason: 'TIMEOUT' });
      }, 5000);
    });

    try {
      await Promise.race([helper.login(username, password), timeout]);
    } catch (e) {
      const error = e as ApiError;
      return Promise.reject(`login failed: ${error}`);
    }

    // login succeeded
    // hide login dialog (if shown), show success notice
    // save salted user credential if asked
    if (save) {
      await storeCredential(username, password);
    }
    dispatch(loggedIn());
    return Promise.resolve();
  };
