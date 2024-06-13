import NewGoal from '../app/components/body/NewGoal';
import "../app/css/goalcomponents.css";

function Goal({ updateGoalCount }){
    return(
        <div className="goal-container">
            <NewGoal updateGoalCount={updateGoalCount}/>
        </div>
    );
}

export default Goal;