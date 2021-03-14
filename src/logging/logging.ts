export interface Event {
  action: string;
  label?: string;
  value?: number;
  context?: any;
}

export interface Logging {
  event(event: Event): void;
  error(e: any): void;
  log(e: any): void;
}
