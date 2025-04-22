import bcrypt from 'bcryptjs';

export const generate4DigitPin = (): string => {

    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  };
  
  export const validateCode = async (
    storedCode: string,
    inputCode: string
  ): Promise<boolean> => {
    return await bcrypt.compare(inputCode, storedCode);
  };