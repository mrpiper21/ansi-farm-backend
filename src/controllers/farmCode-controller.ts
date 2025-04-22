import { generate4DigitPin } from "../scripts";
import FarmerCode from '../model/farmerCodeModel'
import bcrypt from 'bcryptjs';


export const generateFarmerCode = async (req: any, res: any) => {
    try {
      const { email } = req.body;
      const pin = generate4DigitPin();
      
      const codeEntry = await FarmerCode.create({email: email, code: pin, createdAt: new Date()}
      );
  
      // Return plain text code for admin to share
      return res.status(201).json({
        success: true,
       code: pin,
       createdAt: new Date()
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false,
        message: 'Error generating farmer code'
      });
    }
  };
  
  
  // Validate code
  export const validateFarmerCode = async (req: any, res: any) => {
    try {
      const { email, code } = req.body;
  
      // Find valid code
      const codeEntry = await FarmerCode.findOne({
        email,
        createdAt: { $gt: new Date(Date.now() - 600000) }
      });
  
      if (!codeEntry) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired code'
        });
      }
  
      // Validate code
      const isValid = await bcrypt.compare(code, codeEntry.code);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid code'
        });
      }
  
      // Code validated successfully
      res.json({
        success: true,
        message: 'Code validated successfully'
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
  