import cv2

# Open a connection to the webcam (0 is the default camera)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

c = 0
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    if not ret:
        print("Error: Could not read frame.")
        break

    # Process the frame (e.g., convert to grayscale)
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Here you can add any processing you want to do with the frame
    # For example, save the frame to a file
    cv2.imwrite("frame_" + str(c) + ".jpg", gray_frame)

    # Break the loop after processing (for demonstration purposes)
    # if c > 2:
    #     break
    break
    c += 1

# Release the capture
cap.release()
