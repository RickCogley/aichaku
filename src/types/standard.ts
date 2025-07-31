/**
 * Standard type definitions
 */

export interface Standard {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  summary?: {
    critical?: string;
    [key: string]: string | undefined;
  };
  integration_url?: string;
}
