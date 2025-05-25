import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../types/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Handle both routes with and without params using function overloads
export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
): void {
  if (!navigationRef.isReady()) return;

  const [name, params] = args;
  navigationRef.navigate(name as any, params as any);
}
