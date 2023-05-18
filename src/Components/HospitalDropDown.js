import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

export default function HospitalDropdown() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const loading = open && options.length === 0;

  React.useEffect(() => {

    if (!loading) {
      return undefined;
    }

    (async () => {
    axios.get(`${process.env.REACT_APP_BE_URL}/user/self/hospitals`).then(resp =>{
        setOptions(resp.data);
        for(let i = 0; i < resp.data.length; i++){
            options[i] = resp.data[i]['name']
        }
    }).catch(function (error) {
        if(error.response){
            alert(error.response.data.message)
        }else{
            alert(error)
        }
    });
    })();

  }, [loading]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      size='small'
      id="asynchronous-demo"
      fullWidth
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          size='small'
          {...params}
          name='hospital'
          label="Hospital"
          required
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}

