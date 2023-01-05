import api, { route } from "@forge/api";
import ForgeUI, { render, Fragment, Text, AdminPage , Heading, Code ,SectionMessage,Image  } from "@forge/ui";



const App = () => {
  return (
    <Fragment>
      <SectionMessage title="App Configuration" appearance="info">
       <Text>
          User will get Intial Blocks/Tools  as per admin configuration evaluation.          
      </Text>
      <Text>
      &nbsp;
      </Text>
      <Text>
       &nbsp;
       </Text>
      <Text>
          Ex#1. Lets say admin want to set game for every sprint then they can configure  as per below Example,
          you can create JQL to fetch all the stories/tasks developed using last sprint with DONE date as dataset
          </Text>
          <Text>
          <Code text="issuetype = Story AND status = Done AND created >= -15d and assignee = currentUser() order by created DESC" /> 
          </Text>
          <Text>
          Ex#2. JQL that returns all the bugs resolved in last 15 Days with resolvedDate as dataset. 
          </Text>
          <Text>
          <Code text="type = Bug AND assignee = currentUser() AND resolved >= -15d" />           
         </Text>
         <Text>
          Ex#3. CQL that returns all the document created Since 2022/12/20
          </Text>
          <Text>
          <Code text="type=page AND (creator=currentUser() or contributor=currentUser()) and created >= '2022/12/20'" />           
         </Text>
         <Text>
       &nbsp;
       </Text>
      <Text>
         Blocks Category : Tool type admin want to set per configured JQL/SQL
      </Text>
      <Text>
       &nbsp;
       </Text>
      <Text>
          Multiple : Tools = Whatever data QL return * This Field value
      </Text>
      </SectionMessage>
      <Image
        src="data:image/png;base64,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"
        alt="Admin Screen"
        size="medium"
      />
    </Fragment>
  );
};
 
export const run = render(
  <AdminPage>
    <App />
   </AdminPage>
);