import type {
  AlertAction,
  AlertContextState,
} from "@/components/AlertContextTypes";

export const initialState: AlertContextState = {
  alerts: [],
};
export const alertReducer = (
  state: AlertContextState,
  action: AlertAction,
): AlertContextState => {
  switch (action.type) {
    case "ADD_ALERT": {
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    }
    case "REMOVE_ALERT": {
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload.id),
      };
    }
    case "SET_ALERT_OPEN": {
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id
            ? {
                ...alert,
                open: action.payload.open,
              }
            : alert,
        ),
      };
    }
    default: {
      return state;
    }
  }
};
export const generateId = (): string => Math.random().toString(36).slice(2, 11);
