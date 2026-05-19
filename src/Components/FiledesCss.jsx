export const text = `
#parent-input {
      width: 100%;
      height: auto;
      margin-top: 0px;
      margin-bottom: 0px;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
    }
    label {
      margin-bottom: 5px;
      display: block;
      color: #555;
    }
    input:focus,
    input:hover {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    input {
      --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
      width: 100%;
      padding: 10px 20px;
      border-radius: 5px;
      color: #575757;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
        var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
    }
    input::placeholder {
      height: auto;
    }
`

export const textarea = `
   #parent-input {
      width: 100%;
      height: auto;
      margin-top: 0px;
      margin-bottom: 0px;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
    }
    label {
      margin-bottom: 5px;
      display: block;
      color: #555;
    }
    textarea:focus,
    textarea:hover {
      border-color: #3498ff;
    }
    textarea:focus,
    textarea:hover {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    textarea {
      --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
      width: 100%;
      padding: 10px 20px;
      border-radius: 5px;
      color: #575757;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
        var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
    }
    input::placeholder {
      height: auto;
    }
`

export const text_content = `
.text-element{
    color: #555;
    font-size: 14px;
    font-weight: 500;
  }
`

export const tabs = `
.btn-tabs {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 10px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}
.btn-tabs.active {
  background: #009fff;
  color: #fff;
}
.btn-tabs:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  border-color: #e5e7eb;
}
`

export const multiple_select = `
#parent-input{
  width:100%;
  height:auto;
  margin-top:0px;
  margin-bottom:0px;
  margin-inline-start:0px;
  margin-inline-end:0px;
}
label{
margin-bottom:5px;
display:block;
color:#555;
}

.MuiOutlinedInput-notchedOutline {
  border-color: rgba(47, 43, 61, 0.2);
}
.Mui-focused .MuiOutlinedInput-notchedOutline {
  border-color: #3498ff;
}
.MuiChip-sizeMedium.MuiChip-colorDefault {
  background-color: #3498ff;
  color: white;
}
  .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary{
    padding: 0px !important;
  }
.MuiSvgIcon-fontSizeMedium.MuiChip-deleteIcon.MuiChip-deleteIconMedium {
  color: white;
}
`

export const button = `
.btn{
background-color: #009fff;
color: white;
padding: 10px 20px;
border-radius: 5px;
width:100%;
cursor: pointer;
transition: all 0.3s ease;
}
.btn:hover{
  background-color: #009dff87;
}
.btn:disabled{
  background-color: #009fff87 !important;
  cursor: not-allowed !important;
}
`

export const date = `
label{
margin-bottom:5px;
display:block;
color:#555;
}
input:focus,
input:hover {
  border-color: #3498ff;
}
input:focus {
  outline: 3px solid #3498ff40 ;
}
input {
  width:100%;
  padding:10px 20px;
  border-radius:5px;
  border:1px solid #e5e5ea;
  height:auto;
  margin-top:0px;
  margin-bottom:0px;
  margin-inline-start:0px;
  margin-inline-end:0px;
  background-color:transparent;
  color:#575757;
}
  input::placeholder {
  height:auto;
  color: #dfdfdf;
}
  #calendar-icon{
  color:#555;
  }

`

export const file = `
#file-upload-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom:0px;
  width: 100%;
}
#label-color{
    color: #3498ff;
    font-weight:bold;
    font-size:20px;
    text-transform:capitalize;
}
label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 2px dashed ;
  border-color:#d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: #f9fafb;
  transition: background-color 0.2s;
  min-height: 16rem;
  transition: all 0.3s ease-in-out;
}

label:hover {
 border-radius: 1rem;
}

#file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5px;
  padding-bottom: 5px;
  color: #6b7280;
}

#file-upload-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 5px;
}

#file-upload-text {
  margin-bottom: 5px;
  font-size: 0.875rem;
  margin-top:0px;
}

#file-upload-text .font-semibold {
  font-weight: 600;
}

#file-upload-subtext {
  font-size: 0.75rem;
  margin-top:0px;
}

input {
  display: none;
}
  `

export const select = `
 #first-label {
      margin-top: 0px;
      margin-bottom: 5px;
      display: block;
      color: #555;
    }
    #custom-select {
      position: relative;
      width: 100%; /* عرض الـ select */
    }

    #custom-select select {
      --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
      width: 100%;
      padding: 10px 20px;
      border-radius: 5px;
      color: #575757;
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
        var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
    }

    #custom-select::after {
      content: "\\25BC";
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      pointer-events: none;
      color: #3498ff;
      font-size: 14px;
    }

    /* Hide arrow for disabled custom select */
    #custom-select:has(select:disabled)::after {
      content: none;
    }

    #custom-select select:focus {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    /* Remove native blue arrow for disabled/readOnly/aria-disabled selects */
    select:disabled,
    select[aria-disabled='true'],
    select[readonly],
    .MuiInputBase-root.Mui-disabled select {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      background-image: none !important;
      background-position: right 0.5rem center !important;
      background-repeat: no-repeat !important;
    }
    /* Hide IE/Edge arrow */
    select:disabled::-ms-expand {
      display: none;
    }
    /* Disabled custom select appearance */
    #custom-select select:disabled {
      background-color: #f3f4f6;
      color: #9ca3af;
      border-color: #e5e7eb;
      -webkit-text-fill-color: #9ca3af;
      cursor: not-allowed;
    }

    /* MUI Select: hide arrow when disabled */
    .MuiFormControl-root .Mui-disabled + .MuiSelect-icon,
    .MuiInputBase-root.Mui-disabled .MuiSelect-icon,
    .MuiInputBase-root.Mui-disabled .MuiNativeSelect-icon,
    .MuiNativeSelect-icon.Mui-disabled {
      display: none !important;
    }
    .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline {
      border-color: #e5e7eb !important;
    }
    .MuiInputBase-root.Mui-disabled {
      background-color: #f3f4f6 !important;
      cursor: not-allowed;
    }
    .MuiInputBase-root.Mui-disabled .MuiSelect-select {
      color: #9ca3af !important;
      -webkit-text-fill-color: #9ca3af;
    }
    .MuiFormLabel-root.Mui-disabled {
      color: #9ca3af !important;
    }
`

export const radio = `
 #first-label {
      margin-top: 0px;
      margin-bottom: 5px;
      display: block;
      color: #555;
    }

    input[type="radio"] + label {
      margin-top: 0.3em;
      margin-bottom: 0.3em;
      margin-inline-start: 0.3em;
      margin-inline-end: 0.3em;
      display: flex;
      align-items: center;
      color: #555;
      cursor: pointer;
      padding: 0.2em;
      text-transform: capitalize;
    }

    input[type="radio"] {
      display: none;
    }

    input[type="radio"] + label:before {
      content: "\\25CF";
      border: 0.1em solid #999;
      border-radius: 0.2em;
      width: 1em;
      height: 1em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-inline-end: 0.2em;
      vertical-align: bottom;
      color: transparent;
      transition: 0.2s;
      border-radius: 50%;
    }

    input[type="radio"] + label:active:before {
      transform: scale(0);
    }

    input[type="radio"]:checked + label:before {
      background-color: #191919;
      border-color: #191919;
      color: #fff;
    }

    input[type="radio"]:disabled + label:before {
      transform: scale(1);
      border-color: #aaa;
    }

    input[type="radio"]:checked:disabled + label:before {
      transform: scale(1);
      background-color: #191919;
      border-color: #191919;
    }
    #view-input-in-form-engine {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
    }
`

export const checkbox = `
  #parent-input {
      width: 100%;
      height: auto;
      margin-top: 0px;
      margin-bottom: 0px;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
    }
    #shape {
      display: flex;
    }
    #first-label {
      margin-top: 0px;
      margin-bottom: 5px;
      display: block;
      color: #555;
    }

    input[type="checkbox"] + label {
      margin-top: 0.3em;
      margin-bottom: 0.3em;
      margin-inline-start: 0.3em;
      margin-inline-end: 0.3em;
      display: flex;
      align-items: center;
      color: #555;
      cursor: pointer;
      padding: 0.2em;
      text-transform: capitalize;
    }

    input[type="checkbox"] {
      display: none;
    }

    input[type="checkbox"] + label:before {
      content: "\\2714";
      border: 0.1em solid #999;
      border-radius: 0.2em;
      width: 1em;
      height: 1em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-inline-end: 0.2em;
      vertical-align: bottom;
      color: transparent;
      transition: 0.2s;
    }

    input[type="checkbox"] + label:active:before {
      transform: scale(0);
    }

    input[type="checkbox"]:checked + label:before {
      background-color: #191919;
      border-color: #191919;
      color: #fff;
    }

    input[type="checkbox"]:disabled + label:before {
      transform: scale(1);
      border-color: #aaa;
    }

    input[type="checkbox"]:checked:disabled + label:before {
      transform: scale(1);
      background-color: #191919;
      border-color: #191919;
    }
`

export const progress_bar = `
/* The background track */
.progress-container {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 25px;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden; /* Keeps the bar inside the rounded corners */
  margin: 20px 0;
}

/* The moving bar */
.progress-bar {
  width: 0%; /* Change this to control progress */
  height: 30px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: width 0.5s ease-in-out;
  box-shadow: 0 3px 10px rgba(79, 172, 254, 0.4);
}

/* The percentage text */
.progress-text {
  color: white;
  font-family: sans-serif;
  font-weight: bold;
  font-size: 14px;
  margin-right: 15px;
}
`

export const collapse_section = `
.collapse-header {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #1f3a5f;
  background: linear-gradient(to bottom, #f8fafc, #eef3f9);
  border: 1px solid #d6e0ef;
  border-left: 4px solid #1f3a5f;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  cursor: pointer;
  user-select: none;
}
.collapse-arrow {
  font-size: 11px;
  transition: transform 0.2s;
}
`