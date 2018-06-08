# INSTALLATIONS:
# first try:
# sudo apt-get install python3-numpy 
# pip install opencv-python

# alternatives:
# sudo apt-get install python-opencv
# pip install opencv-contrib-python



import sys
import os
import cv2
import numpy as np
from pathlib import Path
import base64
from tkinter import messagebox

import chess_math
import math
#from matplotlib import pyplot as plt

# Config
resized_norm = 400
clahe_cliplimit = 30
clahe_tilegridsize = 4
threshold_value = 160
threshold_type = 0
canny_min = 400
canny_max = 500
canny_size = 3
houghlinesp_rho = 8
houghlinesp_theta = 180
houghlinesp_threshold = 50
houghlinesp_minlength = 25
houghlinesp_maxgap = 100

debug=False



def nothing(x):
    pass


def readimage(filename):
    destination = cv2.imread(filename, cv2.IMREAD_COLOR)
    if debug:
        cv2.imshow("Debug Window", destination)
        cv2.waitKey(2000)
    return destination


def resize(source):
    source_height, source_width = source.shape[:2]
    if debug:
        print("source height:" + str(source_height))
        print("source width:" + str(source_width))
    if (source_height != 0 and source_width != 0):
        if (source_height >= source_width):
            destination_width=int(resized_norm)
            destination_height=int(source_height*(resized_norm/source_width))
        if (source_height < source_width):
            destination_height=int(resized_norm)
            destination_width=int(source_width*(resized_norm/source_height))
        if debug:
            print("new height:" + str(destination_height))
            print("new width:" + str(destination_width))
        destination = cv2.resize(source, (destination_width, destination_height), interpolation=cv2.INTER_CUBIC)
        if debug:
            cv2.imshow("Debug Window", destination)
            cv2.waitKey(2000)
        return destination


def gray(source):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        destination = cv2.cvtColor(source, cv2.COLOR_BGR2GRAY)
        if debug:
            cv2.imshow("Debug Window", destination)
            cv2.waitKey(2000)
        return destination


def clahe(source):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        clahe_def = cv2.createCLAHE(clipLimit=clahe_cliplimit/10, tileGridSize=(clahe_tilegridsize, clahe_tilegridsize))
        destination = clahe_def.apply(source)
        if debug:
            cv2.imshow("Debug Window", destination)
            cv2.waitKey(2000)
        return destination


def threshold(source):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        #_, destination = cv2.threshold(source, threshold_value, 255, threshold_type)
        _, destination = cv2.threshold(source, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        #destination = cv2.adaptiveThreshold(source, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        if debug:
            cv2.imshow("Debug Window", destination)
            cv2.waitKey(2000)
        return destination


def canny(source):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):

        # compute the median of the single channel pixel intensities
        sigma=0.33
        v = np.median(source)
        lower = int(max(0, (1.0 - sigma) * v))
        upper = int(min(255, (1.0 + sigma) * v))

        print(lower)
        print(upper)
        # source = cv2.GaussianBlur(source, (3, 3), 0)

        # destination = cv2.Canny(source, lower, upper)
        destination = cv2.Canny(source, canny_min, canny_max, canny_size)
        if debug:
            cv2.imshow("Debug Window", destination)
            cv2.waitKey(2000)
        return destination


def houghlinesp(source):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        linesp = cv2.HoughLinesP(image=source, rho=houghlinesp_rho/10, theta=(np.pi / houghlinesp_theta), threshold=houghlinesp_threshold, minLineLength=houghlinesp_minlength, maxLineGap = houghlinesp_maxgap)
        return linesp



def draw_lines(source,lines):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        destination = source.copy()
        if lines is not None:
            for i in lines:
                x1, y1, x2, y2 = i.ravel()
                cv2.line(destination, (x1, y1), (x2, y2), (255, 0, 0), 2)
        return destination


def draw_line_list(source,line_list,color):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        destination = source.copy()
        if line_list is not None:
            for line in line_list:
                x1 = line[0]
                y1 = line[1]
                x2 = line[2]
                y2 = line[3]
                cv2.line(destination, (x1, y1), (x2, y2), color, 1)
        return destination




def draw_points(source,points):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        destination = source.copy()
        if points is not None:
            for point in points:
                x = int(point[0])
                y = int(point[1])
                cv2.circle(destination, (x, y), 5, (0, 0, 255), 2)
        return destination



def draw_main_angles(source,angles):
    source_height, source_width = source.shape[:2]
    if (source_height != 0 and source_width != 0):
        destination = source.copy()
        if angles is not None:
            for angle in angles:
                x1=int(source_width/2)
                y1=int(source_height/2)
                x2=int(source_width / 2 + math.cos(angle) * 100)
                y2=int(source_height / 2 + math.sin(angle) * 100)
                cv2.line(destination, (x1, y1), (x2, y2), (0, 255, 0), 2)
        return destination



def toolchain(filename):
    cv2.namedWindow("Debug Window", cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Debug Window', 600, 600)
    image_original = readimage(filename)
    image_resize = resize(image_original)
    image_gray = gray(image_resize);
    image_clahe = clahe(image_gray);
    image_threshold = threshold(image_clahe);
    image_canny = canny(image_clahe);
    line_set = houghlinesp(image_canny);
    line_list = chess_math.get_list_from_linearray(line_set)

    # divide the houghlines in two parts
    line_list_horizontal = chess_math.divide_line_list_by_average_angle(line_list,0)
    line_list_vertical = chess_math.divide_line_list_by_average_angle(line_list,1)
    print("horizontal lines: "+str(len(line_list_horizontal)))
    print("vertical lines: "+str(len(line_list_vertical)))
    #line_list_horizontal=chess_math.eliminate_identicals(line_list_horizontal)
    #line_list_vertical=chess_math.eliminate_identicals(line_list_vertical)
    print("horizontal lines identicals washed: "+str(len(line_list_horizontal)))
    print("vertical lines identicals washed: "+str(len(line_list_vertical)))
    #line_list_horizontal=chess_math.eliminate_sectioners(line_list_horizontal, image_resize)
    #line_list_vertical=chess_math.eliminate_sectioners(line_list_vertical, image_resize)
    print("horizontal lines washed: "+str(len(line_list_horizontal)))
    print("vertical lines washed: "+str(len(line_list_vertical)))
    image_result = draw_line_list(image_resize, line_list_horizontal,(0, 255, 0))
    image_result = draw_line_list(image_result, line_list_vertical,(255, 0, 0))
    print(line_list_horizontal)
    print(line_list_vertical)

    cv2.imshow("Debug Window", image_result)
    cv2.waitKey(1500)


    print(line_set.shape[:1])

    main_angles=chess_math.get_main_angles(line_set)
    #chma.print_line_length(line_set);
    line_list=chess_math.get_list_from_linearray(line_set)
    print(line_list)
    # draw the results
    image_result = draw_lines(image_resize, line_set)
    image_result = draw_main_angles(image_result, main_angles)

    sections=[]
    if line_list_horizontal is not None:
        for line1 in line_list_horizontal:
            for line2 in line_list_vertical:
                sections.append(chess_math.section_point_2d(line1,line2))
    print(sections)
    print(len(sections))

    reduced_sections=chess_math.reduce_points(sections, 5)
    print(reduced_sections)
    print(len(reduced_sections))


    image_result = draw_points(image_resize, reduced_sections)


    cv2.imshow("Debug Window", image_result)
    cv2.waitKey(150000)



	#// draw the result
	#image_resize.copyTo(image_result);
	#image_result=draw_lines(image_result,line_set);
	#image_result=draw_main_angles(image_result);
	#cv::imshow(windowname[10], image_result);






# bild einlesen

# messagebox.showinfo("Title", "a Tk MessageBox")
#dir_path = os.path.dirname(os.path.realpath(__file__))
#current_pic_path = "/work_data/5.jpg"
#filename=dir_path + current_pic_path
#toolchain(filename)

# get the base64 image through the pipe
data = sys.stdin.readline()
# decode image
image=base64.b64decode(data)
nparr = np.fromstring(image, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
# show image
# cv2.namedWindow("Debug Window", cv2.WINDOW_NORMAL)
# cv2.resizeWindow('Debug Window', 600, 600)
# cv2.imshow("Debug Window", img)
# cv2.waitKey(2000)
# generate FEN string
FEN='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
# send FEN string back
print(FEN)
sys.stdout.flush()













