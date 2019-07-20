# -*- coding: utf-8 -*-
import os

folder="dist"
text_css_origin="<link rel=\"stylesheet\" href=\"./index.css\" />"
text_js_origin="<script src=\"./index.js\"></script>"

def main():
    html=open(os.path.join(folder,"index.html")).read()
    js=open(os.path.join(folder,"index.js")).read()
    css=open(os.path.join(folder,"index.css")).read()
    text_css="<style>{}</style>".format(css)
    text_js = "<script>{}</script>".format(js)
    html=html.replace(text_css_origin,text_css)
    html=html.replace(text_js_origin, text_js)
    with open(os.path.join(folder,"index.html"),"w") as fd:
        fd.write(html)
    os.remove(os.path.join(folder,"index.js"))
    os.remove(os.path.join(folder, "index.css"))

#我不会搞webpack,干脆用python算了，简单粗暴
if __name__=="__main__":
    main()