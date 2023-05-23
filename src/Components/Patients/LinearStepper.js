import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import NewEntry from './NewEntry';
import UploadPage from './UploadPage';
import UploadTests from './UploadTests';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';

export default function LinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [entryID, setEntryID] = React.useState(null);
  const [done, setDone] = React.useState(-1);
  const findingBtnRef = React.useRef();
  const imageBtnRef = React.useRef();
  const reportBtnRef = React.useRef();
  const navigate = useNavigate();

  const steps = [
    {
      label: 'Findings',
      component: <NewEntry entryID={entryID} setDone={setDone} setEntryID={setEntryID} btnRef={findingBtnRef} setLoading={setLoading}/>,
    },
    {
      label: 'Images',
      component: <UploadPage setDone={setDone} entryID={entryID} btnRef={imageBtnRef} setLoading={setLoading}/>,
    },
    {
      label: 'Test Reports',
      component: <UploadTests setDone={setDone} entryID={entryID} btnRef={reportBtnRef} setLoading={setLoading}/>,
    },
  ];
  
  const handleNext = () => {
    if(activeStep === 0){
      findingBtnRef.current.click();
    }else if(activeStep === 1){
      imageBtnRef.current.click();
    }else if (activeStep === 2){
      reportBtnRef.current.click();
    }
  };

  const handleReset = () => {
    navigate(`/manage/my/draftentries/${entryID}`)
  };

  const isStepOptional = (index)=>{
    return (index === 1 || index === 2)
  }

  const handleSkip = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  React.useEffect(()=>{
    if(done === activeStep){
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  },[done])

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                isStepOptional(index) ? (
                  <Typography variant="caption">Optional</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {step.component}
              <Box sx={{ mb: 2 }}>
                <Stack direction='row' mt={3} spacing={2}>
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    onClick={handleNext}
                  > Save and Next
                  </LoadingButton>
                  {isStepOptional(activeStep) && (
                    <Button variant='contained' color="inherit" disabled={loading} onClick={handleSkip} sx={{ mr: 1 }}>
                      Skip
                    </Button>
                  )}

                </Stack>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>Entry is added successfully!</Typography>
          <Button variant='contained' onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            {/* Assign Reviewers */}
            Save as Draft
          </Button>
        </Paper>
      )}
    </Box>
  );
}