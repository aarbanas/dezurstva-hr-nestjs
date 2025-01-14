export const baseEmailTemplate = (data: string): string => {
  return `<!DOCTYPE html>
<html lang="hr-HR">
<head>
  <meta charset="UTF-8">
  <title>Dežurstva.com</title>
  <style>
      body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
      }
      .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .email-header {
          text-align: center;
          background-color: #FF5151FF;
          color: #ffffff;
          padding: 20px;
          border-radius: 8px 8px 0 0;
      }
      .email-body {
          padding: 20px;
          color: #333333;
      }
      .email-body h1 {
          color: #FF5151FF;
      }
      .email-footer {
          text-align: center;
          font-size: 12px;
          color: #999999;
          padding: 10px;
      }
      .cta-button {
          background-color: #FF5151FF;
          color: #ffffff;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          text-decoration: none;
          font-size: 16px;
      }
  </style>
</head>
<body>
${data}
</body>
</html>`;
};
