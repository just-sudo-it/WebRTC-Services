// Define the structure of file data for file sharing
export interface FileData {
  name: string
  content: Blob // Assuming the file content is sent as a string (e.g. Base64)
}
