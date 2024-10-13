# EduRecap: Intelligent Text Summarization and Concept Extraction Tool

## Project Overview

EduRecap is a mobile application designed to enhance the learning experience for students by providing features such as automatic recording and transcription of lectures, summarization of key points, multilingual support, and chatbot integration. The app addresses challenges like absenteeism and difficulty in taking comprehensive notes during lectures.

## Features

- **User Authentication**: Users can log in and access their personalized dashboards.
- **Home Screen**: Displays content from users/students, creating a collaborative environment for sharing resources.
- **Create Tab**: Users can upload videos that will appear on the public home screen.
- **Audio Processing**: Users can upload or record audio live, generating transcripts, concise summaries, and flashcards from lectures.
- **Chatbot Integration**: A chatbot allows users to ask specific questions about lecture summaries instead of going through the entire lecture.
- **Bookmark Screen**: Users can store transcripts and audio files, organizing them by subject for easy retrieval and playback.
- **Profile Management**: Users can view their profile information and sign out.

## Technologies Used

- **Frontend**: React Native, Expo
- **Backend**: FastAPI
- **State Management**: Redux
- **Libraries**: Various libraries for audio processing, text summarization, and chatbot functionality.

## Installation

### Prerequisites

- Node.js and npm (Node Package Manager)
- Expo CLI
- Python (for the backend)
- Required libraries and packages as listed in `package.json` and `requirements.txt`

### Steps to Run the Project Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/BALASANKARP/Edurecap.git
   cd Edurecap
2.**Install Frontend Dependencies**:
```bash
   Copy code
   cd app
   npm install
Start the Frontend:

bash
Copy code
npm start
Set Up the Backend:

Navigate to the backend directory and install dependencies:
bash
Copy code
cd ../backend
pip install -r requirements.txt
Run the Backend:

bash
Copy code
uvicorn fast_api:app --reload
Contributing
Contributions are welcome! If you would like to contribute to this project, please fork the repository and create a pull request with your changes.



### Customization Tips:
- **Update Features**: If there are more features or specific details about how they work, add them.
- **Installation Instructions**: Ensure the installation steps match the actual requirements for running your project.
- **License**: Specify the license type you want to use (if applicable).
- **Contact Information**: You can add your contact information if you’d like to receive inquiries or feedback.

Feel free to modify this template to fit your project better! Let me know if you need any further adjustments or details.
