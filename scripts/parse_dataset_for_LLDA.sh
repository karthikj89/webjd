#!/bin/sh

#Go to the folder containg the datasets
cd /Users/brianlao/Documents/Spring\ 2014/CS\ 224U/224UProject/Data


#(1) Grep only the lines with questions in them (there are some lines with a link in them). (2) a) In the labels field, replace any spaces with nothing so that LLDA doesn't read them as separate labels; b) In the labels field, replace commas (which separate different labels) with a space so that LLDA will distinguish them as different labels; c) Only print the line if there is a label attached to it. (3) Remove the first line, which is not a question.

grep -v '/questions/' RocketLawyerPrelimData_titlequestionTagsState.txt | sed 1d | awk -F'\t' -v OFS='\t' '{gsub(/ /,"",$2); gsub(/,/," ",$2); if (length($2)!=0) print $2, $1}' > parsed_RocketLawyerPrelimData_titlequestionTagsState.txt

#Print the total number of questions and the number of questions that are multi-labeled (fall into multiple legal areas)
echo 'The number of total questions:'
cat parsed_RocketLawyerPrelimData_titlequestionTagsState.txt | wc -l

echo 'The number of multi-labeled questions (fall into multiple legal areas):'
cut -f1,1 parsed_RocketLawyerPrelimData_titlequestionTagsState.txt | grep ' ' | wc -l