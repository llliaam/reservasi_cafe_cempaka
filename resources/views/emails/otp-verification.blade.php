<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Verification - Cempaka Cafe</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #f97316, #f59e0b);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #f97316;
            background-color: #fff7ed;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            letter-spacing: 8px;
            border: 2px dashed #f97316;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        .warning {
            background-color: #fef3cd;
            border: 1px solid #fde047;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 Cempaka Cafe</h1>
            <p>Email Verification</p>
        </div>

        <div class="content">
            @if($userName)
                <h2>Hello {{ $userName }}!</h2>
            @else
                <h2>Hello!</h2>
            @endif

            <p>Thank you for registering with Cempaka Cafe. To complete your registration, please use the verification code below:</p>

            <div class="otp-code">
                {{ $otp }}
            </div>

            <p>Enter this code in the registration form to verify your email address.</p>

            <div class="warning">
                <strong>⚠️ Important:</strong>
                <br>• This code will expire in 10 minutes
                <br>• Don't share this code with anyone
                <br>• If you didn't request this, please ignore this email
            </div>

            <p>We're excited to have you join our community of food lovers!</p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Cempaka Cafe. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
