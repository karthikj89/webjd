f = open("data/parsed_numbered_RocketLawyerPrelimData_titlequestionTagsState.csv")

lines = f.readlines()[0]
lines = lines.split('\r')

categories = {}

count = 1
for line in lines:
    entries = line.split(",")
    question = entries[2]
    question = question.replace('"', '')
    print question
#    cats = entries[1].split(" ")
#    for cat in cats:
#        if cat not in categories:
#            categories[cat] = str(count)
#            count = count + 1
#    nums = [categories[cat] for cat in cats]
#    print "%s\t%s"%(entries[0], "["+",".join(nums)+"]")

