"use client";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function RichEditor({ value, onChange }: any) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey="sqcvl270217ehj127zvl4ioe8p17dci4i4r6kvyaog8csn1c"  
      value={value}
      onEditorChange={onChange}
      init={{
        height: 350,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table code help wordcount"
        ],
        toolbar:
          "undo redo | bold italic underline | fontfamily fontsize | " +
          "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image media | table | code fullscreen",
      }}
    />
  );
}
