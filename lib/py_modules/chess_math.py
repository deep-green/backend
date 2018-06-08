import math

def section_nully_2d(line1):
    x1 = line1[0]
    y1 = line1[1]
    x2 = line1[2]
    y2 = line1[3]
    a1 = 0
    b1 = 0
    a2 = 0
    b2 = 10
    f = x2 - x1
    g = y2 - y1
    h = a2 - a1
    e = b2 - b1
    nue=0
    mue=0
    if ((g*h-e*f)!=0):
        nue = (b1*f-y1*f-a1*g+x1*g)/(g*h-e*f)
        if (f!=0):
            mue = (a1+h*nue-x1)/f
    section=[]
    if (mue!=0 and nue!=0):
        section_x = x1 + (x2 - x1) * mue
        section_y = y1 + (y2 - y1) * mue
    else:
        section_x = -1
        section_y = -1
    section.append(section_x)
    section.append(section_y)
    return section


def section_nullx_2d(line1):
    x1 = line1[0]
    y1 = line1[1]
    x2 = line1[2]
    y2 = line1[3]
    a1 = 0
    b1 = 0
    a2 = 10
    b2 = 0
    f = x2 - x1
    g = y2 - y1
    h = a2 - a1
    e = b2 - b1
    nue=0
    mue=0
    if ((g*h-e*f)!=0):
        nue = (b1*f-y1*f-a1*g+x1*g)/(g*h-e*f)
        if (f!=0):
            mue = (a1+h*nue-x1)/f
    section=[]
    if (mue!=0 and nue!=0):
        section_x = x1 + (x2 - x1) * mue
        section_y = y1 + (y2 - y1) * mue
    else:
        section_x = -1
        section_y = -1
    section.append(section_x)
    section.append(section_y)
    return section


def section_point_2d(line1,line2):
    x1 = line1[0]
    y1 = line1[1]
    x2 = line1[2]
    y2 = line1[3]
    a1 = line2[0]
    b1 = line2[1]
    a2 = line2[2]
    b2 = line2[3]
    f = x2 - x1
    g = y2 - y1
    h = a2 - a1
    e = b2 - b1
    nue=0
    mue=0
    if ((g*h-e*f)!=0):
        nue = (b1*f-y1*f-a1*g+x1*g)/(g*h-e*f)
        if (f!=0):
            mue = (a1+h*nue-x1)/f
    section=[]
    if (mue!=0 and nue!=0):
        section_x = x1 + (x2 - x1) * mue
        section_y = y1 + (y2 - y1) * mue
    else:
        section_x = -1
        section_y = -1
    section.append(section_x)
    section.append(section_y)
    return section


def distance_points_2d(point1,point2):
    x1=point1[0]
    y1=point1[1]
    x2 = point2[0]
    y2 = point2[1]
    ax = x2 - x1
    ay = y2 - y1
    distance = math.sqrt(ax * ax + ay * ay)
    return distance



def reduce_points(points,distance):
    reduced_points=[]
    if points is not None:
        for point1 in points:
            takeover=True
            if reduced_points is not None:
                for point2 in reduced_points:
                    if (distance_points_2d(point1,point2))<distance:
                        takeover=False
            if takeover==True:
                reduced_points.append(point1)
    return reduced_points



def line_length_2d(line):
    x1 = line[0]
    y1 = line[1]
    x2 = line[2]
    y2 = line[3]
    ax = x2 - x1
    ay = y2 - y1
    length = math.sqrt(ax * ax + ay * ay)
    return length




def get_list_from_line(line):
    line_list = []
    x1, y1, x2, y2 = line.ravel()
    line_list.append(x1)
    line_list.append(y1)
    line_list.append(x2)
    line_list.append(y2)
    line_list.append(line_length_2d(line_list))
    line_list.append(get_angle_from_line(line_list))
    return line_list


def get_list_from_linearray(linearray):
    unsorted_list = []
    for line in linearray:
        line_list = get_list_from_line(line)
        unsorted_list.append(line_list)
    sorted_list=sorted(unsorted_list, key=lambda line: line[4], reverse=True)
    return sorted_list


def divide_line_list_by_average_angle(line_list,direction):
    divided_list = []
    counter=0
    angle_sum=0
    for line in line_list:
        counter += 1
        angle_sum += line[5]
    average_angle=angle_sum/counter
    for line in line_list:
        counter += 1
        if (line[5]<=average_angle):
            if (direction == 0):
                divided_list.append(line)
        else:
            if (direction == 1):
                divided_list.append(line)
    return divided_list


def eliminate_sectioners(line_list, source_image):
    source_height, source_width = source_image.shape[:2]
    new_list = []
    angle_sum=0
    for line1 in line_list:
        counter = 0
        for line2 in line_list:
            section_point=section_point_2d(line1,line2)
            if (section_point[0]!=-1 and section_point[1]!=-1):
                if (section_point[0]>=0 and section_point[0]<=source_width):
                    if (section_point[1] >= 0 and section_point[1] <= source_height):
                        counter += 1
        if (counter<8):
            new_list.append(line1)
    return new_list


def eliminate_identicals(line_list):
    sorted_list=sorted(line_list, key=lambda line: line[4])
    new_list = []
    counter_01=0
    for line1 in sorted_list:
        counter_01 += 1
        takeover = True
        section_line1_x = section_nullx_2d(line1)
        section_line1_y = section_nully_2d(line1)
        counter_02 = 0
        for line2 in sorted_list:
            counter_02 += 1
            section_line2_x = section_nullx_2d(line2)
            section_line2_y = section_nully_2d(line2)
            if counter_02>counter_01:
                if (abs(get_angle_from_line(line1)-get_angle_from_line(line2))<0.05):
                    if (section_line2_x[0]!=-1):
                        if (abs(section_line2_x[0] - section_line1_x[0]) < 5):
                            takeover=False
                    if (section_line2_y[1] != -1):
                        if (abs(section_line2_y[1] - section_line1_y[1]) < 5):
                            takeover = False
        if (takeover == True):
            new_list.append(line1)
    return new_list


def get_angle_from_line(line):
    x1 = line[0]
    y1 = line[1]
    x2 = line[2]
    y2 = line[3]
    y = y2 - y1
    x = x2 - x1
    if (x != 0):
        angle = math.atan(abs(y) / abs(x))
        if (y >= 0 and x < 0):
            angle = math.pi - angle
        if (y < 0 and x >= 0):
            angle = math.pi - angle
    else:
        angle = math.pi
    return angle


def get_average_angle(linearray):
    angle_sum = 0
    counter=0
    for line in linearray:
        counter = counter + 1
        line_angle = get_angle_from_line(line)
        angle_sum += line_angle
    average_angle = angle_sum / counter
    return average_angle



def get_main_angles(linearray):
    main_angles=[]
    line_list_01=[]
    line_list_02=[]
    angle_sum_01 = 0
    angle_sum_02 = 0
    counter_01=0
    for line in linearray:
        counter_01 = counter_01 + 1
        line_angle = get_angle_from_line(get_list_from_line(line))
        angle_sum_01 += line_angle
    angle_average = angle_sum_01 / counter_01
    angle_sum_01 = 0
    angle_sum_02 = 0
    counter_01 = 0
    counter_02 = 0
    for line in linearray:
        line_angle = get_angle_from_line(get_list_from_line(line))
        if (line_angle < angle_average):
            counter_01 += 1
            line_list_01.append(line)
            angle_sum_01 += line_angle
        else:
            counter_02 += 1
            line_list_02.append(line)
            angle_sum_02 += line_angle
    main_angle_01 = angle_sum_01 / counter_01
    main_angle_02 = angle_sum_02 / counter_02
    print("main_angle_01:"+str(main_angle_01*180/math.pi))
    print("main_angle_02:"+str(main_angle_02*180/math.pi))
    main_angles.append(main_angle_01)
    main_angles.append(main_angle_02)
    return main_angles
