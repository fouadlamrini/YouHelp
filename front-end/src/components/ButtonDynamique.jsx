import React from 'react'

const ButtonDynamique = ({title,stylecolor,width}) => {
  return (
    <button style={{color:stylecolor,width:width}}>{title}</button>
  )
}

export default ButtonDynamique
