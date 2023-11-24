// src/App.js
import React, { useState, useRef } from "react";
import "./App.css";

const API_URL =
  "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";
const API_KEY =
  "VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM";

function App() {
  const [comicText, setComicText] = useState(Array(10).fill(""));
  const [annotationPanelText, setAnnotationPanelText] = useState(
    Array(10).fill("")
  );
  const [comicImages, setComicImages] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);

  const comicDisplayRef = useRef(null);

  const handleDownloadComic = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions based on the comic display size
    canvas.width = comicDisplayRef.current.offsetWidth;
    canvas.height = comicDisplayRef.current.offsetHeight;

    const comicPanels =
    comicDisplayRef.current.querySelectorAll(".comic-panel");


    const image = document.querySelector('.hero');
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    comicPanels.forEach((panel, index) => {

      const leftPanel = document.querySelector('.left');
      const rect = leftPanel.getBoundingClientRect();
      const img = panel.querySelector("img");
      if(!img){
        return;
      }
    
      const annotationBox = panel.querySelector(".box1");
      const imgX = panel.offsetLeft -  (window.screen.width<800?0:rect.width ) - 64;
      const imgY = panel.offsetTop - (window.screen.width<800?rect.height:0);
      console.log(index,rect.width,rect.height,imgX,imgY,panel.offsetTop,panel.offsetLeft)
      const imgWidth = img.width;
      const imgHeight = img.height;
  

      // Draw the image onto the canvas
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

      // Draw the annotation box onto the canvas
      
      if (annotationBox) {
        const annotation = annotationBox.querySelector(".annotation").innerText;
        const boxX = imgX + 20;
        const boxY = imgY + annotationBox.offsetTop + 32;
       
        ctx.fillStyle = "white"; // Set the background color of the annotation box
        ctx.fillRect(boxX, boxY, 230, 30);

        ctx.font = "20px Bangers";
        ctx.fillStyle = "black"; // Set the text color of the annotation
        ctx.fillText(annotation, boxX + 10, boxY + 25); // Adjust the position as needed
      }
    });

    // Convert the canvas content to a data URL and trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "comic_collage.png";
      a.click(); 
  };

  const handleInputChange = (index, value) => {
    const newText = [...comicText];
    newText[index] = value;
    setComicText(newText);
  };

  const handleAnnotationChange = (index, value) => {
    const newAnnotationText = [...annotationPanelText];
    newAnnotationText[index] = value;
    setAnnotationPanelText(newAnnotationText);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const images = await Promise.all(
        comicText.map(async (text, index) => {
          if (!text) {
            return {
              imageUrl: null,
              annotation: "Write some text instead of generating an image.",
            };
          }

          const data = { inputs: text };
          const response = await query(data);

          if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            return { imageUrl, annotation: annotationPanelText[index] };
          } else {
            console.error(
              `Error for Panel ${index + 1}: ${response.statusText}`
            );
            return {
              imageUrl: null,
              annotation: `Error: ${response.statusText}`,
            };
          }
        })
      );

      setComicImages(images);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnotherComic = () => {
    setComicText(Array(10).fill(""));
    setAnnotationPanelText(Array(10).fill(""));
    setComicImages(Array(10).fill(null));
  };

  const query = async (data) => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          Accept: "image/png",
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error("Error in query function:", error.message);
      throw error;
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="left">
          <header>
            <h1 style={{fontFamily:'Alegreya', fontSize:"3rem"}}>Craft Your Comics!</h1>
          </header>
          <form onSubmit={(e) => e.preventDefault()}>
            {comicText.map((text, index) => (
              <div key={index} className="panel-inputs">
                {/* <p>{index+1}</p> */}
                <div className="panel-text">
                  <textarea
                    placeholder="Imagine your Image"
                    style={{ fontFamily: 'Bangers', width:'12rem'}}
                    className="textarea-name"
                    value={text}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </div>
                <div className="Annotation-text">
                  <textarea
                    placeholder='Enter Annotation'
                    style={{ fontFamily: 'Bangers', width:'12rem'}}
                    className="textarea-anot "
                    value={annotationPanelText[index]}
                    onChange={(e) =>
                      handleAnnotationChange(index, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <div className="buttons">
              <button type="button" onClick={handleSubmit} disabled={loading}
              style={{

                fontWeight: 600,
                // width:"1vw",
                flex: 1,
                // padding: '10px',
                background: '#4CAF50',
                color: 'white',
                border: '2px solid black',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight:16,
              }}>
                {loading ? "Generating Comic..." : "Create Comic"}
              </button>
              <button type="button" onClick={handleGenerateAnotherComic}
              style={{
           
                fontWeight: 600,
                // width:"1vw",
                flex: 1,
                
                // padding: '10px',
                background: '#f44336',
                color: 'white',
                border: '2px solid black',
                borderRadius: '5px',
                cursor: 'pointer',
              }}>
                Clean Slate
              </button>
            </div>
          </form>
        </div>
        <div style={{width:20}}></div>
        {/* {loading && <div className="loader"></div>} */}
        <div className="right" ref={comicDisplayRef}>
          <div className="comic-display">
            {comicImages.map(
              (panel, index) =>
                panel && (
                  <div key={index} className="comic-panel">
                    {panel.imageUrl ? (
                      <img
                        style={{
                          border:"5px solid black",
                        }}
                        src={panel.imageUrl}
                        alt={`Create more ${index + 1}`}
                        height="250px"
                      />
                    ) : (
                      <div></div>
                    )}
                    {panel.annotation!=="" && panel.annotation !==
                    "Write some text instead of generating an image." ? (
                      <div className="box box1">
                        <div className="annotation">{panel.annotation}</div>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                )
            )}
          </div>
          <button className="download" onClick={handleDownloadComic}
          >Download Comic</button>
        </div>
      </div>
        <img src={require('./Assets/Hero.jpg')} alt=""  style={{display:"none"}} className="hero"/>
    </div>
  );
}

export default App;
