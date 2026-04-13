export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Manage: undefined;
  Rewards: undefined;
  Settings: undefined;
};

export type ManageStackParamList = {
  Manage: undefined;
  ManageDetails: { habitId?: string };
};
