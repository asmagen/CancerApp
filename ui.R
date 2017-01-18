#library(shiny)
shinyUI(fluidPage(
	theme="style.css",
	onmouseup="selected=null",
	onresize="setCanvasDimensions()",
	tags$title("Alex Lugo's Cancer App"),
	fluidRow(
		id="header",
		column(3,
			id="logoColumn",
			tags$h2("Cancer App",id="logo",title="Super G-Type 2 font by gomarice on 1001fonts.com")
		),
		column(3,
			textInput("searched","Search Genes...",placeholder="ex. ABI1,A2M,ABCD1")
		),
		column(3,
			tags$br(),
			tags$input(type="file",id="uploader",multiple="false",onchange="onUpload()"),
			tags$label("Zoom: "),
			tags$button("+",type="button",onclick="zoomIn()"),
			tags$button("-",type="button",onclick="zoomOut()"),
			tags$input("Filter single-interaction nodes",type="checkbox",id="filter"),
			tags$select(id="colorFilter",
				tags$option("don't filter interaction type",value="all"),
				tags$option("low-low (1)(red)",value="0"),
				tags$option("low-med (2)(yellow)",value="1"),
				tags$option("low-high (3)(orange)",value="2"),
				tags$option("med-low (4)(purple)",value="3"),
				tags$option("med-med (5)(blue)",value="4"),
				tags$option("med-high (6)(pink)",value="5"),
				tags$option("high-low (7)(gray)",value="6"),
				tags$option("high-med (8)(cyan)",value="7"),
				tags$option("high-high (9)(green)",value="8")
			)
		),
		column(3,
			id="shoutoutColumn",
			tags$br(),
			tags$a("by Alex Lugo",href="http://alugocp.github.io/resume",title="Click to access Alex's resume",style="vertical-align:center")
		)
	),
	fluidRow(
		mainPanel(
			tags$canvas(id="canvas",onclick="clickCanvas()",onmousedown="mousedown(event)",onmousemove="mousemove(event)",onmouseleave="selected=null"),
			tags$br(),
			tags$br(),
			tags$br(),
			plotOutput("km"),
			textOutput("nodeData"),
			textOutput("description"),
			tags$script(src="frontEnd.js")
		)
	)
))
