
export enum Mode {
  CHEMISTRY = "CHEMISTRY",
  PHYSICS = "PHYSICS",
  ADVANCED_MATH = "ADVANCED_MATH",
}

export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
  imagePreview?: string;
};
