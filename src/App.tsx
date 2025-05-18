import { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import type { Marker, MapBounds } from './types'
import './App.css'

// Set worker path for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Example markers and bounds
  const markers: Marker[] = [
    { x: 11, y: 5 },
    { x: 4, y: 7 },
    { x: 4, y: 4 }
  ]

  const mapBounds: MapBounds = {
    xmin: 2,
    xmax: 12,
    ymin: 3,
    ymax: 23
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPdfFile(file)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  // Convert map coordinates to pixel coordinates
  const mapToPixelCoordinates = (marker: Marker, containerWidth: number, containerHeight: number) => {
    const xRange = mapBounds.xmax - mapBounds.xmin
    const yRange = mapBounds.ymax - mapBounds.ymin

    const x = ((marker.x - mapBounds.xmin) / xRange) * containerWidth
    const y = ((mapBounds.ymax - marker.y) / yRange) * containerHeight

    return { x, y }
  }

  return (
    <div className="app-container">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="file-input"
      />

      {pdfFile && (
        <div className="pdf-container" ref={containerRef}>
          <TransformWrapper>
            <TransformComponent>
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                className="pdf-document"
              >
                <div className="page-container">
                  {Array.from(new Array(numPages), (_, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  ))}
                  {containerRef.current && markers.map((marker, index) => {
                    const { x, y } = mapToPixelCoordinates(
                      marker,
                      // @ts-expect-error need better tsconfig
                      containerRef.current.clientWidth,
                      // @ts-expect-error need better tsconfig
                      containerRef.current.clientHeight
                    )
                    return (
                      <div
                        key={`marker_${index}`}
                        className="marker"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`
                        }}
                      />
                    )
                  })}
                </div>
              </Document>
            </TransformComponent>
          </TransformWrapper>
        </div>
      )}
    </div>
  )
}

export default App