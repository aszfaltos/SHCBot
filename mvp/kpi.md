# KPI

#### Considerations

Our product is not a commercial one, it is service that the University can
provide its students. This means we don't have or shouldn't have real revenue
potential, thus we need to define a **KPI** in a different way.


#### Defining a KPI

Our most important metric is user satisfaction, thus we should have a **KPI**
correlating to this. In chat systems it is an industry standard to have users
rate the answers of the assistant. This can be eather a like dislike button
or even a more complex questionair, however the later would be cumbersome for
users. We need the most straight forward way to rate responses.

According to the above reasoning we should allow users to rate each response
of the assistant in a binary (satisfactory, not satisfactory) way. Later we
can aggregate the collected data into a simple **Satisfaction Rate (SR)**, the
percentage of positive responses.

**SR** is a great metric of monitoring user satisfaction, however it alone 
doesn't reflect the usefulness of our product, hence we should include the 
**User Count (UC)** in our calculations.

We can weight **UC** with **SR**, in a way estimating the number of 
**Satisfied Users (SU)**.

#### Defining the target

A good target would be **8 SU**, with an **SR** no lower than **80%**.
This would mean we could help a number of students with their issues,
and most of them were satisfied with our service.



