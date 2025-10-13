/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { BsDot } from 'react-icons/bs'
import { IoMdSettings } from 'react-icons/io'
import { IoTrash } from 'react-icons/io5'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import EditListItem from './EditListItem'

function SortableItem({ item, index, locale, type, readOnly, onDelete, setOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id
  })

  const [hover, setHover] = useState(false)

  const options = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: item.width || '100%',
      backgroundColor: hover
        ? item.hoverBackgroundColor ?? item.backgroundColor ?? 'transparent'
        : item.backgroundColor ?? 'transparent',
      color: hover ? item.hoverColor ?? item.color ?? 'black' : item.color ?? 'black',
      paddingBlock: item.paddingBlock + 'px' || '10px',
      paddingInline: item.paddingInline + 'px' || '20px',
      borderRadius: item.borderRadius + 'px' || '5px',
      fontSize: item.fontSize + 'px' || '16px',
      fontWeight: item.fontWeight || 'bold',
      border: item.border || 'none',
      borderWidth: item.borderWidth + 'px' || '1px',
      borderColor: hover ? item.hoverBorderColor || 'white' : item.borderColor || 'white',
      borderStyle: item.borderStyle || 'solid',
      transition: 'all 0.1s ease-in-out',
      transform: CSS.Transform.toString(transform),
      transition
    }
  }

  return (
    <li
      ref={setNodeRef}
      {...options}
      {...attributes}
      className='flex relative justify-between items-center px-2 py-4 mb-2 bg-white rounded-md border'
    >
      <div className='flex gap-2 items-center'>
        {/* 👇 This is the DRAG handle */}
        <span
          {...listeners}
          className='!text-main-color cursor-move select-none'
          title={locale === 'ar' ? 'تحريك' : 'Drag'}
        >
          ☰
        </span>
        <span>
          {type === 'order' ? index + 1 + '. ' : <BsDot className='inline-block' />} {item[`text_${locale}`]}
        </span>
      </div>

      {!readOnly && (
        <div className='flex gap-2'>
          <button
            type='button'
            title={locale !== 'ar' ? 'Delete' : 'حذف'}
            onClick={e => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className='w-[30px] h-[30px] hover:bg-red-500 hover:text-white duration-200 rounded-lg shadow text-xl flex items-center justify-center bg-white border border-main-color'
          >
            <IoTrash />
          </button>

          <button
            type='button'
            title={locale !== 'ar' ? 'Setting' : 'التحكم'}
            onClick={e => {
              e.stopPropagation()
              setOpen(item)
            }}
            className='w-[30px] h-[30px] hover:bg-main-color hover:text-white duration-200 rounded-lg shadow text-xl flex items-center justify-center bg-white border border-main-color'
          >
            <IoMdSettings />
          </button>
        </div>
      )}
    </li>
  )
}

function OrderView({ data, locale, onChange, readOnly }) {
  const [hover, setHover] = useState(false)
  const [dataView, setDataView] = useState([])
  const [open, setOpen] = useState(false)
  const type = data.kind ?? 'order'

  const options = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: data.width || '100%',
      backgroundColor: hover
        ? data.hoverBackgroundColor ?? data.backgroundColor ?? 'transparent'
        : data.backgroundColor ?? 'transparent',
      color: hover ? data.hoverColor ?? data.color ?? 'black' : data.color ?? 'black',
      paddingBlock: data.paddingBlock + 'px' || '10px',
      paddingInline: data.paddingInline + 'px' || '20px',
      borderRadius: data.borderRadius + 'px' || '5px',
      fontSize: data.fontSize + 'px' || '16px',
      fontWeight: data.fontWeight || 'bold',
      border: data.border || 'none',
      borderWidth: data.borderWidth + 'px' || '1px',
      borderColor: hover ? data.hoverBorderColor || 'white' : data.borderColor || 'white',
      borderStyle: data.borderStyle || 'solid',
      transition: 'all 0.1s ease-in-out'
    }
  }

  const initialData = {
    text_en: 'Item',
    text_ar: 'عنصر',
    color: 'black',
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontWeight: 'normal',
    paddingBlock: '10px',
    paddingInline: '20px',
    borderRadius: '5px',
    border: 'none',
    borderWidth: '1px',
    borderColor: 'white',
    borderStyle: 'solid',
    transition: 'all 0.1s ease-in-out',
    hoverBackgroundColor: 'transparent',
    hoverColor: 'black',
    hoverBorderColor: 'transparent'
  }

  useEffect(() => {
    if (data.dataView) {
      setDataView(data.dataView)
    } else {
      setDataView([initialData])
      onChange({ ...data, dataView: [initialData] })
    }
  }, [data])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = event => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = dataView.findIndex(item => item.id === active.id)
      const newIndex = dataView.findIndex(item => item.id === over.id)
      const newDataView = arrayMove(dataView, oldIndex, newIndex)
      setDataView(newDataView)
      onChange({ ...data, dataView: newDataView })
    }
  }

  const handleDelete = id => {
    const newData = dataView.filter(item => item.id !== id)
    setDataView(newData)
    onChange({ ...data, dataView: newData })
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      onChange({ ...data, dataView })
    }
  }, [dataView, open])

  return (
    <div {...options}>
      {!readOnly && (
        <>
          <EditListItem
            dataView={dataView}
            setDataView={setDataView}
            open={open}
            handleClose={handleClose}
            locale={locale}
          />
          <Button
            variant='contained'
            onClick={() => {
              const newItem = { ...initialData, id: Date.now() }
              const newDataView = [...dataView, newItem]
              setDataView(newDataView)
              onChange({ ...data, dataView: newDataView })
            }}
          >
            {locale === 'ar' ? 'اضافة عنصر' : 'Add Item'}
          </Button>
        </>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={dataView.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <ul className={`${!readOnly ? 'mt-2' : ''}`}>
            {dataView.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                setOpen={setOpen}
                index={index}
                type={type}
                locale={locale}
                readOnly={readOnly}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default OrderView
