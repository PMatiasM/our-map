import React, { useState } from "react";
import axios from "axios";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Modal } from "react-bootstrap";
import { Pagination, FreeMode } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { v4 as uuidv4 } from "uuid";
import useEffectOnce from "../../hooks/useEffectOnce";
import useWindowSize from "../../hooks/useWindowSize";
import "./style.css";

const baseURL = "http://192.168.15.17:31415"; // trabalhar no tamanho das coisas no telefone

export default function Map() {
  const defaultPlace = {
    name: "",
    position: [],
    icon: {
      file: "",
      size: [],
    },
    images: [],
    videos: [],
    title: "",
    text: "",
  };
  const [show, setShow] = useState(false);
  const [places, setPlaces] = useState([defaultPlace]);
  const [currentPlace, setCurrentPlace] = useState(defaultPlace);
  const [width] = useWindowSize();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getIcon = (iconFile, iconSize) => {
    return L.icon({
      iconUrl: `${baseURL}/files/icons/id/${iconFile}`,
      iconSize: iconSize,
    });
  };

  const handleMuted = (index) => {
    const video = document.querySelector(`#video${index}`);
    video.muted = !video.muted;
  };

  const buildModal = (place) => {
    setCurrentPlace(defaultPlace);
    setCurrentPlace(place);
    handleShow();
  };

  const loadPlaces = async () => {
    try {
      const response = await axios.get(`${baseURL}/places`);
      const { data } = response;
      setPlaces(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffectOnce(() => {
    loadPlaces();
  });

  return (
    <>
      <MapContainer
        center={[-21.755444796836585, -41.3384620909276]}
        zoom={14}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=2bUB5fNNtM0pJ6eb3aWl" />
        {places.map((place) => {
          const { position } = place;
          const { file, size } = place.icon;
          return (
            position.length && (
              <Marker
                key={uuidv4()}
                position={position}
                icon={getIcon(file, size)}
                eventHandlers={{ click: () => buildModal(place) }}
              />
            )
          );
        })}
      </MapContainer>
      <Modal size="xl" show={show} onHide={handleClose} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            <img
              src={`${baseURL}/files/icons/id/${currentPlace.icon.file}`}
              alt=""
            />
            {currentPlace.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Swiper
            slidesPerView={width > 991 ? 3 : 1}
            spaceBetween={15}
            centeredSlides={true}
            freeMode={true}
            modules={[Pagination, FreeMode]}
            grabCursor={true}
            pagination={{
              clickable: true,
            }}
            className="mySwiper"
          >
            {currentPlace.images.map((image) => (
              <SwiperSlide key={uuidv4()}>
                <img src={`${baseURL}/files/images/id/${image}`} alt="" />
              </SwiperSlide>
            ))}
            {currentPlace.videos.map((video, index) => (
              <SwiperSlide key={uuidv4()}>
                <video
                  autoPlay
                  loop
                  muted
                  id={`video${index}`}
                  onClick={() => handleMuted(index)}
                >
                  <source
                    src={`${baseURL}/files/videos/id/${video}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </SwiperSlide>
            ))}
          </Swiper>
          <div
            className={
              currentPlace.title || currentPlace.text ? "modal-text" : ""
            }
          >
            <h1>{currentPlace.title}</h1>
            <p>{currentPlace.text}</p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
