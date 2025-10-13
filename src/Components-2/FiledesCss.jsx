export const text = `
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

`

export const textarea = `
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
textarea:focus,
textarea:hover {
  border-color: #3498ff;
}
textarea:focus {
  outline: 3px solid #3498ff40 ;
}
textarea {
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
textarea::placeholder {
  height:auto;
  color: #dfdfdf;
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
  background: transparent;
  border: 1px solid #009fff;
  padding: 10px;
  color: #555;
  font-size: 14px;
  font-weight: 500;

}
.btn-tabs.active {
  background: #009fff;
  color: #fff;
}`

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
#first-label{
margin-top:0px;
margin-bottom:5px;
display:block;
color:#555;
}
#custom-select {
  position: relative;
  width: 100%; /* عرض الـ select */
}

#custom-select select {
  width: 100%;
  padding: 10px;
  border: 2px solid ;
  border-color: #e5e5ea;
  border-radius: 8px;
  color: #333;
  font-size: 16px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

#custom-select::after {
  content: '\\25BC';
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #3498ff;
  font-size: 14px;
}

#custom-select select:focus {
  outline: none;
  border-color: #3498ff;
  outline: 3px solid #3498ff40 ;

}
`

export const radio = `
#first-label{
margin-top:0px;
margin-bottom:5px;
display:block;
color:#555;
}

  input[type=radio] + label {
   margin-top: 0.3em;
    margin-bottom: 0.3em;
    margin-inline-start: 0.3em;
    margin-inline-end: 0.3em;
    display: flex;
    align-items: center;
    color: #555;
    cursor: pointer;
    padding: 0.2em;
      text-transform: capitalize
}

input[type=radio] {
  display: none;
}

input[type=radio] + label:before {
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
  transition: .2s;
  border-radius:50%;
}

input[type=radio] + label:active:before {
  transform: scale(0);
}

input[type=radio]:checked + label:before {
  background-color: #3498ff;
  border-color: #3498ff;
  color: #fff;
}

input[type=radio]:disabled + label:before {
  transform: scale(1);
  border-color: #aaa;
}

input[type=radio]:checked:disabled + label:before {
  transform: scale(1);
  background-color: #3498ffab;
  border-color: #3498ffab;
}
#view-input-in-form-engine{
  display:flex;
  flex-direction:column;
  flex-wrap:wrap;
}
`

export const checkbox = `
 #parent-input{
  width:100%;
  height:auto;
  margin-top:0px;
  margin-bottom:0px;
  margin-inline-start:0px;
  margin-inline-end:0px;
}
  #shape{
  display:flex;
  fle
  }
#first-label{
margin-top:0px;
margin-bottom:5px;
display:block;
color:#555;
}

  input[type=checkbox] + label {
   margin-top: 0.3em;
    margin-bottom: 0.3em;
    margin-inline-start: 0.3em;
    margin-inline-end: 0.3em;
    display: flex;
    align-items: center;
    color: #555;
    cursor: pointer;
    padding: 0.2em;
      text-transform: capitalize
}

input[type=checkbox] {
  display: none;
}

input[type=checkbox] + label:before {
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
  transition: .2s;
}

input[type=checkbox] + label:active:before {
  transform: scale(0);
}

input[type=checkbox]:checked + label:before {
  background-color: #3498ff;
  border-color: #3498ff;
  color: #fff;
}

input[type=checkbox]:disabled + label:before {
  transform: scale(1);
  border-color: #aaa;
}

input[type=checkbox]:checked:disabled + label:before {
  transform: scale(1);
  background-color: #3498ffab;
  border-color: #3498ffab;
}
`
