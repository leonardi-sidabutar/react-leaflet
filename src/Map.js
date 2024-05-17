import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import axios from 'axios';

const polylinePoints = [
    [3.579375, 98.678882],
    [3.580010, 98.678460],
    [3.581073, 98.679665],
    [3.580504, 98.680237],
];

function ZoomToPolylineButton({ onClick }) {
    return (
        <button onClick={onClick} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
            Zoom to Polyline
        </button>
    );
}

function App() {
    const [geo, setGeo] = useState([]);
    const mapRef = useRef();
    const polylineRef = useRef();
    const polygonRefs = useRef([]);

    useEffect(() => {
        const fetchGeo = async () => {
            try {
                const response = await axios.get('http://localhost:3001/features');
                const data = response.data;
                setGeo(data);  // Access the features array from the GeoJSON
            } catch (error) {
                console.error('Data Gagal Fetching : ', error);
            }
        }
        fetchGeo();
    }, []);

    const convCoord = coordinates => {
        return coordinates[0].map(coord => [coord[1], coord[0]]);  // Convert GeoJSON coordinates to Leaflet's format
    };

    const renderRumah = () => {
        if (geo) {
            polygonRefs.current = [];
            return geo.map((item, index) => {
                const coordinate = item.geometry.coordinates;
                if (coordinate) {
                    const ref = React.createRef();
                    polygonRefs.current[item.id] = ref;
                    return (
                        <Polygon
                            key={item.id}
                            positions={convCoord(coordinate)}
                            color="blue"
                            ref={ref}
                            eventHandlers={{
                                click: () => handlePolygonClick(item.id)
                            }}
                        />
                    );
                }
                return null;
            });
        }
        return null;
    };

    const handleZoomToPolyline = () => {
        if (mapRef.current && polylineRef.current) {
            const bounds = polylineRef.current.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds);
            }
        }
    };

    const handlePolygonClick = (id) => {
        console.log("Polygon clicked:", id);
        if (mapRef.current && polygonRefs.current[id]) {
            const bounds = polygonRefs.current[id].current.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds);
            }
        }
    };

    return (
        <div className="App">
            <div>
                <p>PETA PTPN IV Coordinate</p>
            </div>
            <button onClick={() => handlePolygonClick("00d3")}>
                Leo
            </button>
            <button onClick={() => handlePolygonClick("d1c2")}>
                Hery
            </button>
            <button onClick={() => handlePolygonClick("4882")}>
                Rizky
            </button>
            <MapContainer center={[3.5795713, 98.678006]} zoom={13} style={{ height: '100vh', width: '100%' }} ref={mapRef}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <Polygon positions={polylinePoints} color="red" ref={polylineRef} />
                {renderRumah()}
            </MapContainer>
            <ZoomToPolylineButton onClick={handleZoomToPolyline} />
        </div>
    );
}

export default App;
