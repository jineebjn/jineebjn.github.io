<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Sanitize input
  $name = htmlspecialchars(trim($_POST["name"]));
  $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
  $subject = htmlspecialchars(trim($_POST["subject"]));
  $message = htmlspecialchars(trim($_POST["message"]));

  // Validate email
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Invalid email format.";
    exit;
  }

  // Email configuration
  $to = "info@jineebjn.com";  // Your email
  $headers = "From: $name <$email>\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  $body = "You have received a new message from your website contact form.\n\n";
  $body .= "Here are the details:\n";
  $body .= "Name: $name\n";
  $body .= "Email: $email\n";
  $body .= "Subject: $subject\n";
  $body .= "Message:\n$message\n";

  // Send email
  if (mail($to, $subject, $body, $headers)) {
    echo "OK";
  } else {
    echo "There was an error sending the email.";
  }
} else {
  echo "Invalid request.";
}
?>
