const express = require('express');
/*Gelen request isteklerinde body' yi parse edebilmek için body-parser modülünü alıyoruz*/
const bodyParser = require('body-parser');
/*Mail servisimizi çalıştırabilmek için nodemailer modülünü aldık*/
const nodeMailer = require('nodemailer');
/*gmail entegrasyonu için dahil etmemiz gereken smtp transport modülü*/
const smtpTransport = require('nodemailer-smtp-transport');

const  expressHandlebars = require('express-handlebars');
/*.env dosyasını kullanarak projedeki port,email,host vs gibi değişebilir bilgileri bir yerden yönetebilmek için dotenv modülünü alıyoruz*/
const dotenv = require('dotenv');
/*proje dosyalarıyla ilgili işlem yapacağımız için core olan path modülünü de alıyoruz*/
const  path = require('path');
dotenv.config();

/*.env dosyasındaki PORT değişkenini alıyoruz*/
const PORT=process.env.PORT;

/*uygulamayı yönetebilmek için express modülünü app değişkenine atadık.*/
const app = express();

/*view engine olarak handlebars ' ı set ettik. ve express handlebars modülünü parametre olarak verdik*/
app.engine('handlebars',expressHandlebars({
    defaultLayout: 'contact',
}));
app.set('view engine','handlebars');

/*harici dosyalarımızın olduğu yolu gösteriyoruz*/
app.use('public', express.static(path.join(__dirname, '/public')));


/*Gelen url encoded değerleri de karşılayacağımızı belirttik*/
app.use(bodyParser.urlencoded({extended:false}));
/*Gelen request body nesnesini default olarak json karşılayacağız*/
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('contact');
});

app.post('/send',(request,response)=>{
    const output = `
    <p>Yeni bir iletişim talebin var</p>
    <h3>Iletisim Detayları</h3>
    <ul>  
      <li>Isim: ${request.body.name}</li>
      <li>Firma: ${request.body.company}</li>
      <li>Email: ${request.body.email}</li>
      <li>Telefon: ${request.body.phone}</li>
    </ul>
    <h3>Mesaj</h3>
    <p>${request.body.message}</p>
  `;

    /*smtp standart 587 portunu kullanır. burda belirtilmesede default olarak 587 dir.*/
    const transporter = nodeMailer.createTransport(smtpTransport({
        service: 'gmail',
        port:587,
        host: 'smtp.gmail.com',
        auth: {
            /*Gerçek e posta ve şifresi belirtilecek uygulama yöneticisinin*/
            user: 'gercekeposta@gmail.com',
            pass: 'gerceksifre123456'
        }
    }));

    /*Mail ayarları içersinide gönterilecek içerik html şeklinde yada isteğe bağlı farklı resource type ler ile gönderilebilir.*/
    let mailOptions = {
        from: '"Iletisim bilgileri" <abdullahsevmez@gmail.com>', // sender address
        to: 'abdullahsevmez@gmail.com', // list of receivers
        subject: 'NodeMailer Kullanmayı öğrendin abdullahcım.', // Subject line
        text: 'Hayırlı olsun...', // plain text body
        html: output // html body
    };
    /*mailin gönderildiği metot*/
    transporter.sendMail(mailOptions,(error,info)=>{
       if (error){
           return console.log(error);
       }
        console.log('Message sent is successfull : '+info.messageId);
       response.render('contact',{msg:'Email has been sent'});
    });



});

app.listen(PORT,()=>{
    console.log(`Server Started on `+PORT);
});