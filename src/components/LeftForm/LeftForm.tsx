import React, { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import "./LeftForm.css"

interface Props {
  dropdownData: string[]
  selectValue: (value: string, price: string) => void
}

function LeftForm(props: Props) {
  const [value, setValue] = useState("")
  const [price, setPrice] = useState("")

  function handleChange(
    e: React.ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string }> | (Event & { target: { value: string; name: string } })
  ) {
    setValue(e.target.value)
  }

  return render()

  function render() {
    return (
      <div className="leftWrapper">
        <TextField
          id="outlined-basic"
          label="Price Alert"
          variant="outlined"
          sx={{ width: 300 }}
          onChange={(e) => {
            setPrice(e.target.value)
          }}
        />
        {renderDropdown()}

        <Button
          disabled={value == "" || price == ""}
          variant="contained"
          onClick={() => props.selectValue(value, price)}
          sx={{ marginTop: "2rem", width: "100%" }}
        >
          Select
        </Button>
      </div>
    )
  }

  function renderDropdown() {
    const { dropdownData } = props

    return (
      <div className="selectWrapper">
        <InputLabel id="demo-simple-select-label" sx={{ width: 300, marginTop: "2rem" }}>
          Select a Stock
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          // label="Select a Stock"
          onChange={(e) => handleChange(e)}
          sx={{ width: 300 }}
        >
          {dropdownData &&
            dropdownData.length > 0 &&
            dropdownData.map((item) => {
              return <MenuItem value={item}>{item}</MenuItem>
            })}
        </Select>
      </div>
    )
  }
}

export default LeftForm
