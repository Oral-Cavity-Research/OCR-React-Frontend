import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { useSelector} from 'react-redux';

export default function UserRolesDropdown({setValue}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const userData = useSelector(state => state.data);
  const loading = open && options.length === 0;


  React.useEffect(() => {

    if (!loading) {
      return undefined;
    }

    (async () => {
    axios.get(`${process.env.REACT_APP_BE_URL}/admin/roles`,
    { headers: {
        'Authorization':  `Bearer ${userData.accessToken.token}`,
        'email': JSON.parse(sessionStorage.getItem("info")).email,
    }}).then(resp =>{
        setOptions(resp.data);
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
      fullWidth
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onChange={(ev, val) => setValue(val)}
      isOptionEqualToValue={(option, value) => option.role === value.role}
      getOptionLabel={(option) => option.role}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          size='small'
          {...params}
          name='role'
          label="User Role"
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

