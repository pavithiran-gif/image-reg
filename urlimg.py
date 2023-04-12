import cv2
import urllib.request
import numpy as np
import tkinter as tk
from tkinter import filedialog
import sys

# thres = 0.45 # Threshold to detect object

classNames = []
classFile = r'\Users\pavit\Downloads\Compressed\Object_Detection_Files/coco.names'
with open(classFile,"rt") as f:
    classNames = f.read().rstrip("\n").split("\n")

configPath = r'\Users\pavit\Downloads\Compressed\Object_Detection_Files/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt'
weightsPath = r'\Users\pavit\Downloads\Compressed\Object_Detection_Files/frozen_inference_graph.pb'

net = cv2.dnn_DetectionModel(weightsPath,configPath)
net.setInputSize(320,320)
net.setInputScale(1.0/ 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)

def getObjects(img, thres, nms, draw=True, objects=[]):
    classIds, confs, bbox = net.detect(img,confThreshold=thres,nmsThreshold=nms)

    if len(objects) == 0: objects = classNames
    objectInfo =[]

    if len(classIds) != 0:
        for classId, confidence,box in zip(classIds.flatten(),confs.flatten(),bbox):
            className = classNames[classId - 1]
            if className in objects:
                objectInfo.append([box,className])
                # print(objectInfo)
                print(f"{className}: {confidence}")
                if (draw):
                    cv2.rectangle(img,box,color=(0,255,0),thickness=2)
                    cv2.putText(img,f"{classNames[classId-1].upper()} {round(confidence*100,2)}%",
                    (box[0]+10,box[1]+30),
                    cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)

    return img,objectInfo


if __name__ == "__main__":

    # Load image
    root = tk.Tk()
    root.withdraw()

    # Open a file dialog box to select an image file
    # file_path = filedialog.askopenfilename(title="Select Image File",
    #                                     filetypes=(("Image Files", "*.jpg;*.jpeg;*.png"), ("All files", "*.*")))

    # Read the selected image using cv2.imread()
    # img = cv2.imread(file_path)
    
    # Load image from URL
    # url = "https://www.sciencenews.org/wp-content/uploads/2019/10/110919_review_feat-1028x579.jpg"
    url = sys.argv[1]

    with urllib.request.urlopen(url) as url_response:
        s = url_response.read()
    arr = np.asarray(bytearray(s), dtype=np.uint8)
    img = cv2.imdecode(arr, -1)

    # Resize image to fit screen
    img = cv2.resize(img, (640, 480))

    result, objectInfo = getObjects(img,0.45,0.2)
    #print(objectInfo)
    # cv2.imshow("Output",img)
    cv2.waitKey(0)
