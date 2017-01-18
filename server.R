shinyServer(function(input,output){
	output$km <- renderPlot({
		if(is.null(input$gene)){
			graphData("")
		}else{
			#if(is.null(input$bins) || input$bins=="all"){
				if(input$gene1=="none"){
					graphNode(input$gene,input$bins)
				}else{
					#print(input$addToTitle)
					graphEdge(input$gene,input$gene1,input$addToTitle,input$bins)
				}
			#}else{
			#	if(input$gene1!="none" && length(km)!=9){
			#		isolate(graphEdge(input$gene,input$gene1,input$addToTitle))
			#	}
			#	graphData(title)
			#	for(b in 1:nchar(input$bins)){
			#		if(substr(input$bins,b,b)=="1"){
			#			lines(km[[b]],conf.int=F,mark.tim=F,col=colors[b])
			#		}
			#	}
			#	addLegend()
			#}
		}
	})
	graphNode <- function(gene,selected.bins){
		i <- match(gene,genes)
		bins <- bin.map[i,]
		graphData(gene)
		binsets <- split(data.frame(data[,1:2]),bins[])
		colors <- c("red","blue","green")

		if(substr(selected.bins,1,1)=="1"){
			d <- binsets$"0"
			clin <- with(d,Surv(time,status==1))
			km <- survfit(clin~1,data=d,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[1])
		}
		if(substr(selected.bins,2,2)=="1"){
			d <- binsets$"1"
			clin <- with(d,Surv(time,status==1))
			km <- survfit(clin~1,data=d,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[2])
		}
		if(substr(selected.bins,3,3)=="1"){
			d <- binsets$"2"
			clin <- with(d,Surv(time,status==1))
			km <- survfit(clin~1,data=d,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[3])
		}
	
		rm(binsets,bins,clin,d,km)
		legend(1,0.4,c("low","med","high"),col=colors,lty=c(1,1))
	}
	graphEdge <- function(gene,gene1,addToTitle,selected.bins){
		i <- match(gene,genes)
		i1 <- match(gene1,genes)
		bins <- (bin.map[i,]*3)+bin.map[i1,]+1
		#flipbins <- (bin.map[i1,]*3)+bin.map[i,]+1
		graphData(paste(gene," vs. ",gene1,addToTitle,sep=""))
		binsets <- split(data.frame(data[,1:2]),bins[])
		colors <- c("red","yellow","orange","purple","blue","pink","gray","cyan","green")		

		if(substr(selected.bins,1,1)=="1"){
			bin <- binsets$"1"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[1])
		}
		if(substr(selected.bins,2,2)=="1"){
			bin <- binsets$"2"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[2])
		}
		if(substr(selected.bins,3,3)=="1"){
			bin <- binsets$"3"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[3])
		}
		if(substr(selected.bins,4,4)=="1"){
			bin <- binsets$"4"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[4])
		}
		if(substr(selected.bins,5,5)=="1"){
			bin <- binsets$"5"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[5])
		}
		if(substr(selected.bins,6,6)=="1"){
			bin <- binsets$"6"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[6])
		}
		if(substr(selected.bins,7,7)=="1"){
			bin <- binsets$"7"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[7])
		}
		if(substr(selected.bins,8,8)=="1"){
			bin <- binsets$"8"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[8])
		}
		if(substr(selected.bins,9,9)=="1"){
			bin <- binsets$"9"
			clin <- with(bin,Surv(time,status==1))
			km <- survfit(clin~1,data=bin,conf.type="log-log")
			lines(km,conf.int=F,mark.time=F,col=colors[9])
		}
		
		rm(clin,bins,bin,km)
		legend(1,0.6,c("low-low (1)","low-med (2)","low-high (3)","med-low (4)","med-med (5)","med-high (6)","high-low (7)","high-med (8)","high-high (9)"),col=colors,lty=c(1,1))
	}
	graphData <- function(label){
		plot(fullKm,conf.int=F,mark.time=F,xlab="Time (Days)",ylab="Chance of Survival",main=label)
	}
	#addLegend <- function(){
	#	if(length(colors)==3){
	#		legend(1,0.4,c("low     ","med     ","high     "),col=colors,lty=c(1,1))
	#	}else{
	#		legend(1,0.6,c("low-low (1)     ","low-med (2)     ","low-high (3)     ","med-low (4)     ","med-med (5)     ","med-high (6)     ","high-low (7)     ","high-med (8)     ","high-high (9)     "),col=colors,lty=c(1,1))
	#	}
	#}
	getRole <- function(index){
		i <- match(genes[index],roles[,1])
		if(!is.na(i)){
			return(roles[i,2])
		}
		return("none")
	}
	flip <- function(bin){
		if(bin==2){
			return(4)
		}else if(bin==3){
			return(7)
		}else if(bin==6){
			return(8)
		}
		return(bin)
	}
	output$nodeData <- renderPrint({
		sep <- ",,"
		if(is.na(input$searched)){#is.null()
			print("")
			return()
		}
		searched <- strsplit(input$searched,",")[[1]]
		if(length(searched)==0){
			print("")
			return()
		}
		binColors <- c("red","yellow","orange","purple","blue","pink","gray","cyan","green")
		for(s in 1:length(searched)){
			index <- match(searched[s],genes)
			if(!is.na(index)){
				con <- subset(interactions,interactions[,"y"]==index | interactions[,"x"]==index)
				x <- paste(searched[s],getRole(index),"true",sep=sep)
				if(length(con[,1])==0){
					print(x)
				}else{
					for(i in 1:length(con[,1])){
						if(con[i,"y"]==index){
							connection <- genes[con[i,"x"]]
							color <- binColors[con[i,"bin"]]
						}else{
							connection <- genes[con[i,"y"]]
							color <- binColors[flip(con[i,"bin"])]
						}
						sign <- "+"
						if(con[i,4]<0){
							sign <- "-"
						}
						width <- abs(round(con[i,4],0))#*(factor/30)
						x <- paste(x,connection,color,width,sign,sep=sep)
					}
					print(x)
					for(i in 1:length(con[,1])){
						if(con[i,"y"]==index){
							index1 <- con[i,"x"]
						}else{
							index1 <- con[i,"y"]
						}
						con1 <- subset(interactions,interactions[,"y"]==index1 | interactions[,"x"]==index1)
						x1 <- paste(genes[index1],getRole(index1),"false",sep=sep)
						if(length(con1[,1])>0){
							for(a in 1:length(con1[,1])){
								if(con1[a,"y"]==index1){
									connection <- genes[con1[a,"x"]]
									color <- binColors[con1[a,"bin"]]
								}else{
									connection <- genes[con1[a,"y"]]
									color <- binColors[flip(con1[a,"bin"])]
								}
								sign <- "+"
								if(con1[a,4]<0){
									sign <- "-"
								}
								width <- abs(round(con1[a,4],0))
								x1 <- paste(x1,connection,color,width,sign,sep=sep)
							}
						}
						print(x1)
					}
				}
			}
		}
	})
	output$description <- renderPrint({
		i <- match(input$gene,gene.descriptions$symbol)
		if(is.null(i)){
			x <- paste(input$gene,": No description available for this gene :(",sep="")
		}else{
			x <- paste(input$gene,": ",gene.descriptions$description[i],sep="")
		}
		if(!is.null(input$gene1) && input$gene1!="none"){
			i <- match(input$gene1,gene.descriptions$symbol)
			if(is.null(i)){
				x <- paste(x,",,,",input$gene1,": No description available for this gene :(",sep="")
			}else{
				x <- paste(x,",,,",input$gene1,": ",gene.descriptions$description[i],sep="")
			}
		}
		print(x)
		rm(x)
	})
})
