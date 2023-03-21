import {LinearProgress, Typography} from '@mui/material';

export function stringToColor(string) {
    let i, hash = 0;
    let color = '#';

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
  
    return color;
}

export function stringAvatar(name, size=40) {
    if(!name){
        name = "XX"
    }
    return {
    sx: {bgcolor: stringToColor(name), width: size, height: size},
    children: `${name.split(' ')[0][0]}${name.split(' ')[1]?name.split(' ')[1][0]:""}`,
    };
}

export function passwordStrength(password){

    const lowerAndUpper = password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/);
    const specialCharacter = password.match(/([!,%,&,@,#,$,^,*,?,_,~])/);
    const number = password.match(/([0-9])/);
    const length = password.length > 7;

    if(lowerAndUpper && specialCharacter && number && length){
        return 100;
    }else if(length && (lowerAndUpper || number || specialCharacter)){
        return 50;
    }else if(!length){
        return password.length * 3;
    }else{
        return 30;
    }
}

export const PasswordStrengthIndicator=({password})=>{

    const progress = passwordStrength(password);

    return(
        <>
        <LinearProgress variant="determinate" value={progress} color={progress<30?'error':progress<60?'warning':'success'}/>
        <br/>
        <Typography variant='body2'>The password should satisfy the below constraints.</Typography>
        <ul>
            <li><Typography variant='body2'>Atleast 8 Character</Typography></li>
            <li><Typography variant='body2'>Lowercase & Uppercase</Typography></li>
            <li><Typography variant='body2'>Number (0-9)</Typography></li>
            <li><Typography variant='body2'>Special Character (!@#$%^&*)</Typography></li>
        </ul>
        </>
    )
}


export function age(date) {
    const today = new Date();
    const birthdate = new Date(date);
    // A bool that represents if today's day/month precedes the birth day/month
    const one_or_zero = (today.getMonth() < birthdate.getMonth()) ||
                        (today.getMonth() === birthdate.getMonth() &&
                         today.getDate() < birthdate.getDate());
    
    // Calculate the difference in years from the date object's components
    let year_difference = today.getFullYear() - birthdate.getFullYear();
    
    // The difference in years is not enough. 
    // To get it right, subtract 1 or 0 based on if today precedes the 
    // birthdate's month/day.
    // To do this, subtract the 'one_or_zero' boolean from 'year_difference'
    // (This converts true to 1 and false to 0 under the hood.)
    const age = year_difference - one_or_zero;
    return age;
  }