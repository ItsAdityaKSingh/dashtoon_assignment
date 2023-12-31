// src/App.js
import React, { useState, useRef } from "react";
import "./App.css";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';
import '../node_modules/swiper/swiper-bundle.min.css'

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';



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

    // Setting canvas dimensions based on the comic display size of devixe
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
  

      // Drawing the image onto the canvas
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

      // Drawing the annotation box onto the canvas
      if (annotationBox) {
        const annotation = annotationBox.querySelector(".annotation").innerText;
        const boxX = imgX + 20;
        const boxY = imgY + annotationBox.offsetTop + 32;
       
        ctx.fillStyle = "white"; 
        ctx.fillRect(boxX, boxY, 230, 30);

        ctx.font = "20px Bangers";
        ctx.fillStyle = "black"; 
        ctx.fillText(annotation, boxX + 10, boxY + 25);
      }
    });

    // Converting the canvas content to a data URL and trigger download
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
            <h1 style={{ fontFamily: "Alegreya", fontSize: "3rem" }}>
              Craft Your Comics!
            </h1>
          </header>
          <div
            style={{
              height: "4rem",
            }}
          ></div>
          <form onSubmit={(e) => e.preventDefault()}>
            <Swiper comicText={comicText} />
            <Swiper
              // install Swiper modules
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={50}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              onSwiper={(swiper) => console.log(swiper)}
              onSlideChange={() => console.log("slide change")}
              style={{ width: "100%" }}
              effect={"cube"}
              cubeEffect={{
                shadow: true,
                slideShadows: true,
                shadowOffset: 20,
                shadowScale: 0.94,
              }}
            >
              {/* <div style={{
        height:"2rem",
      }}></div> */}
              {comicText.map((text, index) => (
                <SwiperSlide key={index} className="panel-inputs">
                  {/* <p>{index+1}</p> */}
                  <div className="panel-text">
                    <textarea
                      placeholder="Imagine your Image"
                      style={{ fontFamily: "Bangers", width: "16rem" }}
                      className="textarea-name"
                      value={text}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                  </div>
                  <div className="Annotation-text">
                    <textarea
                      placeholder="Enter Annotation"
                      style={{ fontFamily: "Bangers", width: "16rem" }}
                      className="textarea-anot "
                      value={annotationPanelText[index]}
                      onChange={(e) =>
                        handleAnnotationChange(index, e.target.value)
                      }
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div
              style={{
                height: "4rem",
              }}
            ></div>
            <div className="buttons">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  fontSize: "1rem",
                  fontWeight: "900",
                  flex: 1,
                  fontFamily: "Marvel",
                  background: "#4CAF50",
                  color: "white",
                  border: "2px solid black",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: 16,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0, 0, 0, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                {loading ? "GENERATING YOUR STORY..." : "CREATE COMIC"}
              </button>
              <button
                type="button"
                onClick={handleGenerateAnotherComic}
                style={{
                  fontSize: "1rem",
                  fontWeight: "900",
                  flex: 1,
                  fontFamily: "Marvel",
                  background: "#f44336",
                  color: "white",
                  border: "2px solid black",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0, 0, 0, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                CLEAN SLATE
              </button>
            </div>
          </form>
        </div>
        <div style={{ width: 20 }}></div>
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
                          border: "5px solid black",
                        }}
                        src={panel.imageUrl}
                        alt={`Create more ${index + 1}`}
                        height="250px"
                      />
                    ) : (
                      <div></div>
                    )}
                    {panel.annotation !== "" &&
                    panel.annotation !==
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
          <button
            className="download"
            onClick={handleDownloadComic}
            style={{
              fontSize: "1rem",
              fontWeight: "900",
              // flex: 1,
              fontFamily: "Marvel",
              cursor: "pointer",
            }}
          >
            DOWNLOAD YOUR COMIC
          </button>
        </div>
      </div>
      <img
        src={require("./Assets/Hero.jpg")}
        alt=""
        style={{ display: "none" }}
        className="hero"
      />
    </div>
  );
}

export default App;
