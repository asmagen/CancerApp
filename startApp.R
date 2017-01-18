# load libraries/data
library(survival)
library(shiny)
#load("validation.data.mRNA.RData")
#load("GI.interactions.RData")
load("data/genes.interactions.data.RData")
load("data/patient.data.RData")
load("data/gene.descriptions.final.RData")

# initial data formatting
#clin <- clinical[,17:18]
#rm(clinical)
#data <- cbind2(data.matrix(clin),t(measurements))
#rm(measurements)
#interactions <- dataset$states
#rm(dataset)
formula <- with(clin,Surv(time,status==1))
fullKm <- survfit(formula~1,data=clin,conf.type="log-log")
rm(formula,clin)

# create role table
#load("driver.states.RData")
#roles <- cbind2(dataset[,1:2],dataset[,6:7])
#rm(dataset)
#roles <- subset(roles,roles[,3]!="" | roles[,4]!="")
#names <- c(roles[,1],roles[,2])
#roles <- c(roles[,3],roles[,4])
#roles <- unique(cbind2(names,roles))
#roles <- subset(roles,roles[,2]!="")
#rm(names)

runApp("../CancerApp",host="127.0.0.1",port=2017)
