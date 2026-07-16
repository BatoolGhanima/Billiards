//هذا مجلد وقلبه ملف ضافتهن اية لضرب العصا لغير البيضاء

export function showFoul(){

    const msg =
        document.getElementById("foulMessage");

    msg.style.display="block";

    setTimeout(()=>{

        msg.style.display="none";

    },700);

}