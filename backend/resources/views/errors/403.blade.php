<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 Forbidden</title>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:700,900" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Montserrat', sans-serif;
        }

        #notfound {
            position: relative;
            height: 100vh;
            background-color: #0047AB;
            color: #fff;
            text-align: center;
            overflow: hidden;
        }

        #notfound .logo {
            margin-top: 40px;
        }

        #notfound .logo img {
            width: 200px;
        }

        #notfound .content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 800px;
            width: 100%;
        }

        .content h2 {
            font-size: 26px;
            margin-top: 30px;
            text-transform: uppercase;
        }

        @media only screen and (max-width: 600px) {
            .content h2 {
                font-size: 18px;
                padding: 0 10px;
            }

            #notfound .logo img {
                width: 150px;
            }
        }
    </style>
</head>
<body>

<div id="notfound">
    <div class="content">
        <h2>Anda tidak memiliki izin untuk ini.</h2>
    </div>
</div>

</body>
</html>
