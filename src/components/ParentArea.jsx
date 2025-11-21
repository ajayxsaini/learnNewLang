import React, { useState } from 'react'
import TextArea from './TextArea'
import LangPronArea from './LangPronArea'
import PdfHandleUpload from './PdfHandleUpload'

const ParentArea = () => {
  const [text, setText] = useState("");        // live input
  const [speakText, setSpeakText] = useState(""); // only spoken when Generate clicked

  return (
    <div>
      <TextArea 
        text={text}
        setText={setText}
        onGenerate={() => setSpeakText(text)}   //
      />

      <LangPronArea generatedText={speakText} />  
      <PdfHandleUpload onSelectedText={setText} />
    </div>
  )
}

export default ParentArea
