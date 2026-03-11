import { Button } from "@mui/material";

function TabsComponent({ data, setActiveTab }) {
  
  return (
    <div className='flex justify-end items-center flex-col gap-2'>
      {data?.map((tab, i) => (
        <Button key={i} variant='contained' color='primary' onClick={() => setActiveTab(tab.id)}>
          {tab.name_ar}
        </Button>
      ))}
    </div>
  )
}

export default TabsComponent
